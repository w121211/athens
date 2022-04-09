import * as events from '../events'
import { nextBlock } from '../op/queries'
import { searchService } from '../services/search.service'
import { getBlock } from '../stores/block.repository'
import { rfdbRepo } from '../stores/rfdb.repository'
import { isShortcutKey } from '../utils'
import {
  CaretPosition,
  DestructTextareaKeyEvent,
  Search,
  SearchHit,
} from '../interfaces'
import { getCaretCoordinates } from './textarea-caret'
import { throttle } from 'lodash'

const pairChars = ['()', '[]', '{}', '""']

const pairCharDict: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
}

export const nullSearch: Search = {
  type: null,
  term: null,
  hitIndex: null,
  hits: [],
}

/** Match the last '#' */
const reHashtag = /.*#/s

/** Match the last '[[' */
const reDoc = /.*\[\[/s

/** Match the last '/' */
const reSlash = /.*\//s

//
// Closure Library
//
//
//
//
//
//

function getEndPoints(textfield: Element | null): [number, number] {
  const {
      getEndPoints: _getEndPoints,
    } = require('ts-closure-library/lib/dom/selection'),
    result: [number, number] = _getEndPoints(textfield)
  return result
}

function getText(textfield: Element | null): string {
  const { getText: _getText } = require('ts-closure-library/lib/dom/selection'),
    result: string = _getText(textfield)
  return result
}

// function getText(textfield: HTMLTextAreaElement): string {
//   const s = textfield.value
//   return s.substring(textfield.selectionStart, textfield.selectionEnd)
// }

//
// Helpers
//
//
//
//
//
//

/**
 * "Get the current value of a textarea (`:value`) and
   the start (`:start`) and end (`:end`) index of the selection.
   Furthermore, split the selection into three parts:
   text before the selection (`:head`),
   the selection itself (`:selection`),
   and text after the selection (`:tail`)."
 */
function destructTarget(target: HTMLTextAreaElement) {
  // TODO: rewrite functions instead of import
  const value = target.value,
    [start, end] = getEndPoints(target),
    selection = getText(target),
    head = value.substring(0, start),
    tail = value.substring(end)
  return {
    value,
    start,
    end,
    head,
    tail,
    selection,
  }
}

function destructKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
): DestructTextareaKeyEvent {
  const { key, keyCode, currentTarget: target } = e,
    value = target.value,
    event = {
      key,
      keyCode,
      target,
      value,
    },
    modifiers = modifierKeys(e),
    targetData = destructTarget(target)
  return {
    ...modifiers,
    ...event,
    ...targetData,
  }
}

function isBlockStart(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  const [start] = getEndPoints(event.currentTarget)
  return start === 0
}

function isBlockEnd(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  const { value, end } = destructKeyDown(e)
  return end === value.length
}

function isCharacterKey({
  meta,
  ctrl,
  alt,
  keyCode,
}: DestructTextareaKeyEvent): boolean {
  const { KeyCodes } = require('ts-closure-library/lib/events/keycodes')
  if (!meta && !ctrl && !alt) {
    return KeyCodes.isCharacterKey(keyCode)
  }
  return false
}

function isPairChar(key: string): boolean {
  return key in pairCharDict
}

function modifierKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  const { shiftKey: shift, metaKey: meta, ctrlKey: ctrl, altKey: alt } = e
  return { shift, meta, ctrl, alt }
}

/**
 * ;; https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
;; textarea setval will lose ability to undo/redo

;; execCommand is obsolete:
;; be wary before updating electron - as chromium might drop support for execCommand
;; electron 11 - uses chromium < 90(latest) which supports execCommand
 * 
 */
function replaceSelectionWith(newText: string) {
  // TODO
  document.execCommand('insertText', false, newText)
}

function setCursorPosition(target: HTMLTextAreaElement, idx: number) {
  const { setCursorPosition } = require('ts-closure-library/lib/dom/selection')
  setCursorPosition(target, idx)
}

function setSelection(target: HTMLTextAreaElement, start: number, end: number) {
  // TODO
  const { setStart, setEnd } = require('ts-closure-library/lib/dom/selection')
  setStart(target, start)
  setEnd(target, end)
}

/**
 * https://github.com/tpope/vim-surround
 */
function surround(selection: string, around: string) {
  const complement = pairCharDict[around]
  return complement
    ? around + selection + complement
    : around + selection + around
}

// function throttledDispatchSync(fn: () => void) {
// const { throttle } = require('ts-closure-library/lib/functions/functions')
// fn()
// }

/**
 * "Used by backspace and write-char.
  write-char appends key character. Pass empty string during backspace.
  query-start is determined by doing a greedy regex find up to head.
  Head goes up to the text caret position."
 * 
 * @param head string from the beginning of textarea to caret
 * @param key key-down key, not yet write into the textarea
 */
function updateQuery(
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
  head: string,
  key: string,
) {
  const { type } = search

  let re: RegExp | undefined,
    searchFn: ((term: string) => Promise<SearchHit[]>) | undefined
  switch (type) {
    // case 'block':
    //   break
    case 'hashtag':
      re = reHashtag
      break
    case 'page':
      re = reDoc
      searchFn = searchService.searchNote
      break
    case 'slash':
      re = reSlash
      break
    // case 'template':
    //   break
  }

  if (re && searchFn) {
    const match = head.match(re),
      termStartIdx = match ? match[0].length : null,
      term = termStartIdx !== null && head.substring(termStartIdx) + key

    if (term) {
      searchFn(term).then((hits) => {
        if (type === 'slash' && hits.length === 0) {
          setSearch(nullSearch)
        } else {
          setSearch({ type, term, hitIndex: 0, hits })
        }
      })
    }
  }
}

//
// Auto complete
//
//
//
//
//
//

function _autoCompleteHashtag(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { hits, hitIndex } = search

  if (hitIndex) {
    const { nodeTitle, blockUid } = hits[hitIndex],
      expansion = nodeTitle ?? blockUid,
      { currentTarget } = e

    return autoCompleteHashtag(currentTarget, expansion ?? null, setSearch)
  }
}

export function autoCompleteHashtag(
  target: HTMLTextAreaElement,
  expansion: string | null,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { start, head } = destructTarget(target),
    found = head.match(reHashtag),
    startIdx = found && found[0].length

  if (expansion === null) {
    setSearch(nullSearch)
  } else if (startIdx) {
    setSelection(target, startIdx, start)
    replaceSelectionWith(`[[${expansion}]]`)
    setSearch(nullSearch)
  } else {
    console.error('[autoCompleteHashtag] unexpected case, startIdx === null')
  }
}

/**
 * ;; (nth results (or index 0) nil) returns the index-th result
         ;; If (= index nil) or index is out of bounds, returns nil
         ;; For example, index can be nil if (= results [])
 */
function _autoCompleteInline(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const hitStr = searchService.getAutoCompleteStr(search),
    { currentTarget } = e

  return autoCompleteInline(currentTarget, hitStr, search, setSearch)
}

/**
 * assumption: cursor or selection is immediately before the closing brackets
 */
export function autoCompleteInline(
  el: HTMLTextAreaElement,
  hitStr: string | null,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { term } = search,
    { end } = destructTarget(el)

  if (term) {
    if (hitStr !== null) {
      setSelection(el, end - term.length, end)
      replaceSelectionWith(hitStr)
    }

    // ;; Add the expansion count if we have it, but if we
    // ;; don't just add back the query itself so the cursor
    // ;; doesn't move back.
    const newCursorPos = end - term.length + (hitStr ?? term).length + 2
    setCursorPosition(el, newCursorPos)
  }

  setSearch(nullSearch)
}

//
// Key Handlers
//
//
//
//
//
//

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

function arrowKeyDirection(e: React.KeyboardEvent): boolean {
  return ARROW_KEYS.includes(e.key)
}

function handleArrowKey({ e, uid, caret, search }: TextareaKeyDownArgs) {
  const { key, shift, ctrl, target, selection, start, end, value } =
      destructKeyDown(e),
    isSelection = selection.length > 0,
    isStart = start === 0,
    isEnd = end === value.length,
    // { results, type, index } = state.search,
    // { caretPosition } = state,
    { top, height } = caret,
    textareaHeight = target.offsetHeight, // this height is accurate, but caret-position height is not updating
    rows = Math.round(textareaHeight / height),
    row = Math.ceil(top / height),
    topRow = row === 1,
    bottomRow = row === rows,
    up = key === 'ArrowUp',
    down = key === 'ArrowDown',
    left = key === 'ArrowLeft',
    right = key === 'ArrowRight',
    [charOffset] = getEndPoints(target)

  // ;; Shift: select block if leaving block content boundaries (top or bottom rows). Otherwise select textarea text (default)
  if (shift) {
    if (left) {
      return
    } else if (right) {
      return
      // } else if ((up && topRow) || (down && bottomRow)) {
      //   //
      // }
    }
  }

  //   ;; Control: fold or unfold blocks
  else if (ctrl) {
    if (left) {
      return
    } else if (right) {
      return
    } else if (up || down) {
      //
    }
  }

  //   ;; Type, one of #{:slash :block :page}: If slash commands or inline search is open, cycle through options
  // else if (type) {
  //   if (left || right) {
  //     //
  //   } else if (up || down) {
  //     //
  //   }
  // }

  //
  else if (selection) {
    return
  }

  //   ;; Else: navigate across blocks
  //   ;; FIX: always navigates up or down for header because get-caret-position for some reason returns the wrong value for top

  //   ;; going LEFT at **0th index** should always go to **last index** of block **above**
  //   ;; last index is special - always go to last index when going up or down
  else if ((left && isStart) || (up && isEnd)) {
    events.up(uid, 'end')
  } else if (down && isEnd) {
    events.down(uid, 'end')
  } else if (right && isEnd) {
    events.down(uid, 0)
  } else if (up && topRow) {
    events.up(uid, charOffset)
  } else if (down && bottomRow) {
    events.down(uid, charOffset)
  }
}

/**
 * Backspace
 * If is block start, fire backspace-event
 * If surround is possible pair, close search panel, delete pair string
 *
 */
function handleBackspace({ e, uid, search, setSearch }: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(e),
    { target, value, start, end } = dKeyDown,
    noSelection = start === end,
    subStr = value.substring(start - 1, start + 1),
    possiblePair = pairChars.includes(subStr),
    // text from the beginning to (caret anchor - 1)
    // (anchor-1) for backspace event outcome
    head = value.substring(0, start - 1),
    { type } = search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (isBlockStart(e) && noSelection) {
    events.backspace(uid, value)
  } else if (possiblePair) {
    // ;; pair char: hide inline search and auto-balance
    e.preventDefault()
    setSearch(nullSearch)
    setSelection(target, start - 1, start + 1)
    replaceSelectionWith('')
  } else if ('/' === lookBehindChar && type === 'slash') {
    // ;; slash: close dropdown
    setSearch(nullSearch)
  } else if ('#' === lookBehindChar && type === 'hashtag') {
    // ;; hashtag: close dropdown
    setSearch(nullSearch)
  } else if (';' === lookBehindChar && type === 'template') {
    // ;; semicolon: close dropdown
    setSearch(nullSearch)
  } else if (type !== null) {
    // ;; dropdown is open: update query
    updateQuery(search, setSearch, head, '')
  }
}

/**
 * "Delete has the same behavior as pressing backspace on the next block."
 */
function handleDelete({ e, uid }: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(e),
    { start, end, value } = dKeyDown,
    noSelection = start === end,
    atEnd = value.length === end,
    next = nextBlock(getBlock(uid))

  if (noSelection && atEnd && next) {
    // events.backspace(nextBlock.uid, nextBlock.str, )
  }
}

/**
 *
 */
function handleEnter({ e, uid, search, setSearch }: TextareaKeyDownArgs) {
  e.preventDefault()

  const dKeyDown = destructKeyDown(e),
    { key, shift, ctrl, meta, value, start, end } = dKeyDown,
    { type: searchType } = search

  if (searchType) {
    switch (searchType) {
      case 'slash':
        break
      case 'page':
        _autoCompleteInline(e, search, setSearch)
        break
      case 'hashtag':
        _autoCompleteHashtag(e, search, setSearch)
        break
      case 'template':
        break
    }
  } else if (shift) {
    // ;; shift-enter: add line break to textarea and move cursor to the next line.
    replaceSelectionWith('\n')
  } else {
    // ;; default: may mutate blocks, important action, no delay on 1st event, then throttled
    // throttledDispatchSync(() => {
    //   events.enter(uid, dKeyDown)
    // })

    throttle(() => events.enter(uid, dKeyDown), 100, { trailing: false })()
  }
}

/**
 * athens: BUG: escape is fired 24 times for some reason.
 */
function handleEscape({ e, setSearch }: TextareaKeyDownArgs) {
  e.preventDefault()
  setSearch(nullSearch)
  // events.editingUid(null)
}

function handlePairChar({ e, setSearch, localStr }: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(e),
    { key, target, start, end, selection, value } = dKeyDown,
    closePair = pairCharDict[key]
  // ,lookbehindChar = value.charAt(start) ?? null

  if (closePair === undefined) return

  e.preventDefault()

  // if (key === closePair) {
  //   // ;; when close char, increment caret index without writing more
  //   setCursorPosition(target, start + 1)
  //   setState({ ...state, search: { ...state.search, type: null } })
  // } else
  if (selection === '') {
    replaceSelectionWith(key + closePair)
    setCursorPosition(target, start + 1)

    // need to get current-value because the value is changed by the replace selection event
    const value = e.currentTarget.value
    if (value && value.length >= 4) {
      const fourChar = value.substring(start - 1, start + 3),
        type = fourChar === '[[]]' ? 'page' : null

      // console.debug(fourChar, type)
      if (type) setSearch({ type, term: '', hits: [], hitIndex: null })
    }
  } else if (selection !== '') {
    const surroundSelection = surround(selection, key)
    replaceSelectionWith(surroundSelection)
    setSelection(target, start + 1, end + 1)

    if (localStr.length >= 4) {
      const fourChar =
          localStr.substring(start - 1, start + 1) +
          localStr.substring(end + 1, end + 3),
        doubleBrackets = fourChar === '[[]]',
        type = doubleBrackets ? 'page' : null

      searchService.searchNote(selection).then((v) => {
        if (type) setSearch({ type, term: selection, hits: v, hitIndex: null })
      })
    }
  }
}

/**
 * If undo, save the latest value to block, undo event will be fired on global listener
 *
 */
function handleShortcuts({ e, uid, localStr }: TextareaKeyDownArgs) {
  const { key, shift, value, target } = destructKeyDown(e)

  if (key === 'A') {
    // select all blocks
  } else if (key === 'z') {
    if (shift) {
      // redo
      // events.redo()
    } else {
      // undo
      // document.execCommand('undo')
      // events.blockSave(uid, localStr)
      // e.preventDefault()
      e.stopPropagation()
    }
  }
}

/**
 * "Bug: indenting sets the cursor position to 0, likely because a new textarea element is created on the DOM. Set selection appropriately.
  See :indent event for why value must be passed as well."
 */
function handleTab({ e, localStr }: TextareaKeyDownArgs): void {
  e.preventDefault()

  const dKeyDown = destructKeyDown(e),
    { shift } = dKeyDown,
    rfdb = rfdbRepo.getValue(),
    { selection, editing, currentRoute } = rfdb

  if (editing.uid === null) return

  if (selection.items.length === 0) {
    if (shift) {
      events.unindent(
        editing.uid,
        dKeyDown,
        localStr,
        currentRoute?.uid ?? undefined,
      )
    } else {
      events.indent(editing.uid, dKeyDown, localStr)
    }
  }
}

/**
 * "When user types /, trigger slash menu.
  If user writes a character while there is a slash/type, update query and results."
 */
function writeChar({ e, search, setSearch }: TextareaKeyDownArgs): void {
  const { head, key, value, start } = destructKeyDown(e),
    { type } = search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (key === ' ' && type === 'hashtag') {
    setSearch(nullSearch)
  } else if (key === '/' && type === null) {
    // setState({
    //   ...state,
    //   search: {
    //     type: 'slash',
    //     query: '',
    //     results: slashOptions,
    //     index: 0,
    //   },
    // })
  } else if (key === '#' && type === null) {
    setSearch({ type: 'hashtag', term: '', hits: [], hitIndex: null })
  } else if (key === ';' && lookBehindChar === ';' && type === null) {
    setSearch({ type: 'template', term: '', hits: [], hitIndex: null })
  } else if (type) {
    updateQuery(search, setSearch, head, key)
  }
}

type TextareaKeyDownArgs = {
  e: React.KeyboardEvent<HTMLTextAreaElement>
  uid: string
  editing: boolean
  localStr: string
  caret: CaretPosition
  setCaret: React.Dispatch<React.SetStateAction<CaretPosition>>
  search: Search
  setSearch: React.Dispatch<React.SetStateAction<Search>>
  setLastKeyDown: React.Dispatch<
    React.SetStateAction<DestructTextareaKeyEvent | null>
  >
}

export function textareaKeyDown(args: TextareaKeyDownArgs) {
  const { editing, e, search, setCaret, setLastKeyDown } = args

  // ;; don't process key events from block that lost focus (quick Enter & Tab)
  if (editing) {
    const dKeyDown = destructKeyDown(e),
      { key, meta, ctrl } = dKeyDown

    // ;; used for paste, to determine if shift key was held down
    setLastKeyDown(dKeyDown)

    // ;; update caret position for search dropdowns and for up/down
    if (search.type === null) {
      const { currentTarget } = e,
        caretPosition = getCaretCoordinates(
          currentTarget,
          currentTarget.selectionEnd,
          {
            debug: true,
          },
        )
      setCaret(caretPosition)
    }

    // ;; dispatch center
    // ;; only when nothing is selected or duplicate/events dispatched
    // ;; after some ops(like delete) can cause errors
    if (rfdbRepo.getValue().selection.items.length === 0) {
      if (arrowKeyDirection(e)) {
        handleArrowKey(args)
      } else if (isPairChar(key)) {
        handlePairChar(args)
      } else if (key === 'Tab') {
        handleTab(args)
      } else if (key === 'Enter') {
        handleEnter(args)
      } else if (key === 'Backspace') {
        handleBackspace(args)
      } else if (key === 'Delete') {
        handleDelete(args)
      } else if (key === 'Escape') {
        handleEscape(args)
      } else if (isShortcutKey(meta, ctrl)) {
        handleShortcuts(args)
      } else if (isCharacterKey(dKeyDown)) {
        writeChar(args)
      }
    }
  }
}
