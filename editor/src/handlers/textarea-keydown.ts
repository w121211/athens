import { KeyboardEvent } from 'react'
import * as events from '../events'
import { blockRepo, getBlock } from '../stores/block.repository'
import { nextBlock } from '../op/queries'
import { rfdbRepo } from '../stores/rfdb.repository'
import { shortcutKey } from '../utils'
import {
  CaretPosition,
  DestructTextareaKeyEvent,
  Search,
  SearchType,
} from '../interfaces'
import { getCaretCoordinates } from './textarea-caret'
import { throttle } from 'lodash'

const PAIR_CHARS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
}

const nullSearch: Search = { type: null, results: [], query: '', index: -1 }

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

function destructKeyDown(e: KeyboardEvent): DestructTextareaKeyEvent {
  const key = e.key,
    keyCode = e.keyCode,
    target = e.target as HTMLTextAreaElement,
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

function isBlockStart(event: KeyboardEvent<HTMLTextAreaElement>) {
  const [start] = getEndPoints(event.currentTarget)
  return start === 0
}

function isBlockEnd(event: KeyboardEvent) {
  const { value, end } = destructKeyDown(event)
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
  return key in PAIR_CHARS
}

function modifierKeys(event: KeyboardEvent) {
  const { shiftKey: shift, metaKey: meta, ctrlKey: ctrl, altKey: alt } = event
  return { shift, meta, ctrl, alt }
}

/**
 * ;; https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
;; textarea setval will lose ability to undo/redo

;; execCommand is obsolete:
;; be wary before updating electron - as chromium might drop support for execCommand
;; electron 11 - uses chromium < 90(latest) which supports execCommand
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
  const complement = PAIR_CHARS[around]
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
 */
function updateQuery({
  search,
  setSearch,
  head,
  key,
}: TextareaKeyDownArgs & {
  head: string
  key: string
}) {
  let queryFn, re

  switch (search.type) {
    // case 'block':
    //   break
    case 'page':
      break
    case 'hashtag':
      break
    case 'template':
      break
    case 'slash':
      break
  }

  const results: {
    nodeTitle?: string
    blockStr?: string
    blockUid?: string
  }[] = []

  if (search.type === 'slash' && results.length === 0) {
    setSearch(nullSearch)
  } else {
    setSearch({
      ...search,
      index: 0,
      query: 'newQuery',
      results,
    })
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

/** Match the last '#' */
const reHashtag = /.*#/s

function _autoCompleteHashtag(
  event: KeyboardEvent,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { index, results } = search

  if (index) {
    const { nodeTitle, blockUid } = results[index],
      { target } = event,
      expansion = nodeTitle ?? blockUid

    return autoCompleteHashtag(
      target as HTMLTextAreaElement,
      expansion ?? null,
      setSearch,
    )
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
    setSearch({ type: null, results: [], query: '', index: -1 })
  } else if (startIdx) {
    setSelection(target, startIdx, start)
    replaceSelectionWith(`[[${expansion}]]`)
    setSearch({ type: null, results: [], query: '', index: -1 })
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
  event: KeyboardEvent,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { index, results } = search,
    { nodeTitle, blockUid } = results[index ?? 0],
    { target } = event,
    expansion = nodeTitle ?? blockUid

  return autoCompleteInline(
    target as HTMLTextAreaElement,
    expansion ?? null,
    search,
    setSearch,
  )
}

export function autoCompleteInline(
  target: HTMLTextAreaElement,
  expansion: string | null,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const { query } = search,
    { end } = destructTarget(target)

  // assumption: cursor or selection is immediately before the closing brackets

  if (query) {
    if (expansion !== null) {
      setSelection(target, end - query.length, end)
      replaceSelectionWith(expansion)
    }

    // ;; Add the expansion count if we have it, but if we
    // ;; don't just add back the query itself so the cursor
    // ;; doesn't move back.
    const newCursorPos = end - query.length + (expansion ?? query).length + 2
    setCursorPosition(target, newCursorPos)
  }

  setSearch({ type: null, results: [], query: '', index: -1 })
}

// ------ Key Handlers ------

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

function arrowKeyDirection(e: KeyboardEvent): boolean {
  return ARROW_KEYS.includes(e.key)
}

function handleArrowKey({ event, uid, caret, search }: TextareaKeyDownArgs) {
  const { key, shift, ctrl, target, selection, start, end, value } =
      destructKeyDown(event),
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

function handleBackspace({
  event,
  uid,
  search,
  setSearch,
}: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(event),
    { target, value, start, end } = dKeyDown,
    noSelection = start === end,
    subStr = value.substring(start - 1, start + 1),
    possiblePair = null,
    head = value.substring(0, start - 1),
    { type } = search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (isBlockStart(event) && noSelection) {
    events.backspace(uid, value)
  } else if (possiblePair) {
    // ;; pair char: hide inline search and auto-balance
    event.preventDefault()
    setSearch({ type: null, results: [], query: '', index: -1 })
    setSelection(target, start - 1, start + 1)
    replaceSelectionWith('')
  } else if ('/' === lookBehindChar && type === 'slash') {
    // ;; slash: close dropdown
    setSearch({ type: null, results: [], query: '', index: -1 })
  } else if ('#' === lookBehindChar && type === 'hashtag') {
    // ;; hashtag: close dropdown
    setSearch({ type: null, results: [], query: '', index: -1 })
  } else if (';' === lookBehindChar && type === 'template') {
    // ;; semicolon: close dropdown
    setSearch({ type: null, results: [], query: '', index: -1 })
  } else if (type !== null) {
    // ;; dropdown is open: update query
    // updateQuery(state, head, '', type)
  }
}

function handleEnter({ event, uid, search, setSearch }: TextareaKeyDownArgs) {
  event.preventDefault()

  const dKeyDown = destructKeyDown(event),
    { shift, ctrl, meta, value, start, end } = dKeyDown,
    { type: searchType } = search

  if (searchType) {
    switch (searchType) {
      case 'slash':
        break
      case 'page':
        _autoCompleteInline(event, search, setSearch)
        break
      case 'hashtag':
        _autoCompleteHashtag(event, search, setSearch)
        break
      case 'template':
        break
    }
  } else if (shift) {
    // ;; shift-enter: add line break to textarea and move cursor to the next line.
    replaceSelectionWith('\n')
  } else if (shortcutKey(meta, ctrl)) {
    // ;; cmd-enter: cycle todo states, then move cursor to the end of the line.
    //   ;; 13 is the length of the {{[[TODO]]}} and {{[[DONE]]}} string
    //   ;; this trick depends on the fact that they are of the same length.
  } else {
    // ;; default: may mutate blocks, important action, no delay on 1st event, then throttled
    // throttledDispatchSync(() => {
    //   events.enter(uid, dKeyDown)
    // })

    throttle(() => events.enter(uid, dKeyDown), 100, { trailing: false })()
  }
}

/**
 * "Delete has the same behavior as pressing backspace on the next block."
 */
function handleDelete({ event, uid }: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(event),
    { start, end, value } = dKeyDown,
    noSelection = start === end,
    atEnd = value.length === end,
    next = nextBlock(getBlock(uid))

  if (noSelection && atEnd && next) {
    // events.backspace(nextBlock.uid, nextBlock.str, )
  }
}

function handleEscape({ event, setSearch }: TextareaKeyDownArgs) {
  // "BUG: escape is fired 24 times for some reason."
  event.preventDefault()
  setSearch({ type: null, results: [], query: '', index: -1 })
  events.editingUid(null)
}

function handlePairChar({
  event,
  search,
  setSearch,
  localStr,
}: TextareaKeyDownArgs) {
  const dKeyDown = destructKeyDown(event),
    { key, target, start, end, selection, value } = dKeyDown,
    closePair = PAIR_CHARS[key],
    lookbehindChar = value.charAt(start) ?? null

  if (closePair === undefined) return

  event.preventDefault()

  // if (key === closePair) {
  //   // ;; when close char, increment caret index without writing more
  //   setCursorPosition(target, start + 1)
  //   setState({ ...state, search: { ...state.search, type: null } })
  // } else
  if (selection === '') {
    replaceSelectionWith(key + closePair)
    setCursorPosition(target, start + 1)

    // if (state.str.local && state.str.local.length >= 4) {
    // const fourChar = state.str.local?.substring(start - 1, start + 3)

    const str = event.currentTarget.value
    if (str && str.length >= 4) {
      const fourChar = str.substring(start - 1, start + 3),
        doubleBrackets = fourChar === '[[]]',
        type = doubleBrackets ? 'page' : null

      // console.debug(fourChar, type)

      if (type) {
        setSearch({
          type,
          query: '',
          results: [],
          index: null,
        })
      }
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
        type = doubleBrackets ? 'page' : null,
        queryFn = blockRepo.searchInNodeTitle

      if (type) {
        setSearch({
          type,
          query: selection,
          results: queryFn(selection),
          index: null,
        })
      }
    }
  }
}

/**
 * "Bug: indenting sets the cursor position to 0, likely because a new textarea element is created on the DOM. Set selection appropriately.
  See :indent event for why value must be passed as well."
 */
function handleTab({ event, localStr }: TextareaKeyDownArgs): void {
  event.preventDefault()

  const dKeyDown = destructKeyDown(event),
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
function writeChar({ event, search, setSearch }: TextareaKeyDownArgs): void {
  const { head, key, value, start } = destructKeyDown(event),
    { type } = search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (key === ' ' && type === 'hashtag') {
    setSearch({
      type,
      query: '',
      results: [],
      index: null,
    })
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
    setSearch({
      type: 'hashtag',
      query: '',
      results: [],
      index: 0,
    })
  } else if (key === ';' && lookBehindChar === ';' && type === null) {
    setSearch({
      type: 'template',
      query: '',
      results: [],
      index: 0,
    })
  } else if (type) {
    updateQuery(state, head, key, type)
  }
}

type TextareaKeyDownArgs = {
  event: KeyboardEvent<HTMLTextAreaElement>
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
  const { editing, event, search, setCaret, setLastKeyDown } = args

  // ;; don't process key events from block that lost focus (quick Enter & Tab)
  if (editing) {
    const dKeyDown = destructKeyDown(event),
      { key, meta, ctrl } = dKeyDown

    // ;; used for paste, to determine if shift key was held down
    setLastKeyDown(dKeyDown)

    // ;; update caret position for search dropdowns and for up/down
    if (search.type === null) {
      const target = event.target as HTMLTextAreaElement,
        caretPosition = getCaretCoordinates(target, target.selectionEnd, {
          debug: true,
        })
      setCaret(caretPosition)
    }

    // ;; dispatch center
    // ;; only when nothing is selected or duplicate/events dispatched
    // ;; after some ops(like delete) can cause errors
    if (rfdbRepo.getValue().selection.items.length === 0) {
      if (arrowKeyDirection(event)) {
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
        // } else if (shortcutKey(meta, ctrl)) {
        //   handleShortcuts(event, uid, state)
      } else if (isCharacterKey(dKeyDown)) {
        writeChar(args)
      }
    }
  }
}
