import { useObservable } from '@ngneat/react-rxjs'
import { KeyboardEvent } from 'react'
import { throttle } from 'rxjs'
import { events } from './events'
import { blockRepo, getBlock } from './stores/block.repository'
import { getNextBlock } from './op/helpers'
import { rfdbRepo } from './stores/rfdb.repository'
import { shortcutKey } from './utils'

const PAIR_CHARS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
}

// function getText(textfield: HTMLTextAreaElement): string {
//   const s = textfield.value
//   return s.substring(textfield.selectionStart, textfield.selectionEnd)
// }

// Helpers

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
  const { getEndPoints, getText } = require('ts-closure-library/lib/dom/selection')
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

function modifierKeys(event: KeyboardEvent) {
  const { shiftKey: shift, metaKey: meta, ctrlKey: ctrl, altKey: alt } = event
  return { shift, meta, ctrl, alt }
}

function isBlockStart(event: KeyboardEvent) {
  const { getEndPoints } = require('ts-closure-library/lib/dom/selection'),
    [start]: [number] = getEndPoints(event.target)
  return start === 0
}

function isBlockEnd(event: KeyboardEvent) {
  const { value, end } = destructKeyDown(event)
  return end === value.length
}

function isCharacterKey({ meta, ctrl, alt, keyCode }: DestructTextareaKeyEvent): boolean {
  const { isCharacterKey } = require('ts-closure-library/lib/events/keycodes')
  if (!meta && !ctrl && !alt) {
    return isCharacterKey(keyCode)
  }
  return false
}

function isPairChar(key: string): boolean {
  return key in PAIR_CHARS
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
  return complement ? around + selection + complement : around + selection + around
}

function throttledDispatchSync(fn: () => void) {
  // throttle()
  fn()
}

function updateQuery(state, head, key, type) {
  let queryFn, re
  switch (type) {
    case 'block':
      break
    case 'page':
      break
    case 'hashtag':
      break
    case 'template':
      break
    case 'slash':
      break
  }
}

// Key Handlers

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

function arrowKeyDirection(e: KeyboardEvent): boolean {
  return ARROW_KEYS.includes(e.key)
}

function handleArrowKey(e: KeyboardEvent, uid: string, state: BlockElState) {
  const { key, shift, ctrl, target, selection, start, end, value } = destructKeyDown(e),
    isSelection = selection.length > 0,
    isStart = start === 0,
    isEnd = end === value.length,
    { results, type, index } = state.search,
    { caretPosition } = state,
    // { top, height } = caretPosition,
    textareaHeight = target.offsetHeight, // this height is accurate, but caret-position height is not updating
    // rows = Math.round(textareaHeight / height),
    // row = Math.ceil(top / height),
    // topRow = row === 1,
    // bottomRow = row === rows,
    up = key === 'ArrowUp',
    down = key === 'ArrowDown',
    left = key === 'ArrowLeft',
    right = key === 'ArrowRight'
  // [charOffset] = getEndPoints(target)

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
  else if ((left && start) || (up && isEnd)) {
    events.up(uid, 'end')
  } else if (down && isEnd) {
    events.down(uid, 'end')
  } else if (right && isEnd) {
    events.down(uid, 0)
  }
  // else if (up && topRow) {
  //   events.up(uid, charOffset)
  // } else if (down && bottomRow) {
  //   events.down(uid, charOffset)
  // }
}

function handleBackspace(event: KeyboardEvent, uid: string, state: BlockElState, setState: BlockElStateSetFn) {
  const dKeyDown = destructKeyDown(event),
    { target, value, start, end } = dKeyDown,
    noSelection = start === end,
    subStr = value.substring(start - 1, start + 1),
    possiblePair = null,
    head = value.substring(0, start - 1),
    { type } = state.search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (isBlockStart(event) && noSelection) {
    events.backspace(uid, value)
  } else if (possiblePair) {
    // ;; pair char: hide inline search and auto-balance
    event.preventDefault()
    setState({ ...state, search: { ...state.search, type: null } })
    setSelection(target, start - 1, start + 1)
    replaceSelectionWith('')
  } else if ('/' === lookBehindChar && type === 'slash') {
    // ;; slash: close dropdown
    setState({ ...state, search: { ...state.search, type: null } })
  } else if ('#' === lookBehindChar && type === 'hashtag') {
    // ;; hashtag: close dropdown
    setState({ ...state, search: { ...state.search, type: null } })
  } else if (';' === lookBehindChar && type === 'template') {
    // ;; semicolon: close dropdown
    setState({ ...state, search: { ...state.search, type: null } })
  } else if (type !== null) {
    // ;; dropdown is open: update query
    updateQuery(state, head, '', type)
  }
}

function handleEnter(e: KeyboardEvent, uid: string, state: BlockElState) {
  e.preventDefault()

  const dKeyDown = destructKeyDown(e),
    { shift, ctrl, meta, value, start, end } = dKeyDown,
    searchType = state.search.type

  if (searchType) {
    //
  } else if (shift) {
    // ;; shift-enter: add line break to textarea and move cursor to the next line.
  } else if (shortcutKey(meta, ctrl)) {
    // ;; cmd-enter: cycle todo states, then move cursor to the end of the line.
    //   ;; 13 is the length of the {{[[TODO]]}} and {{[[DONE]]}} string
    //   ;; this trick depends on the fact that they are of the same length.
  } else {
    // ;; default: may mutate blocks, important action, no delay on 1st event, then throttled
    throttledDispatchSync(() => {
      events.enter(uid, dKeyDown)
    })
  }
}

/**
 * "Delete has the same behavior as pressing backspace on the next block."
 */
function handleDelete(event: KeyboardEvent, uid: string, state: BlockElState) {
  const dKeyDown = destructKeyDown(event),
    { start, end, value } = dKeyDown,
    noSelection = start === end,
    atEnd = value.length === end,
    nextBlock = getNextBlock(getBlock(uid))

  if (noSelection && atEnd && nextBlock) {
    // events.backspace(nextBlock.uid, nextBlock.str, )
  }
}

function handleEscape(event: KeyboardEvent, uid: string, state: BlockElState, setState: BlockElStateSetFn) {
  // "BUG: escape is fired 24 times for some reason."
  event.preventDefault()
  setState({
    ...state,
    search: {
      type: null,
      results: [],
      query: null,
      index: null,
    },
  })
  events.editingUid(null)
}

function handlePairChar(event: KeyboardEvent, uid: string, state: BlockElState, setState: BlockElStateSetFn) {
  const dKeyDown = destructKeyDown(event),
    { key, target, start, end, selection, value } = dKeyDown,
    closePair = PAIR_CHARS[key],
    lookbehindChar = value.charAt(start) ?? null

  if (closePair === undefined) return

  event.preventDefault()

  if (lookbehindChar === closePair) {
    // ;; when close char, increment caret index without writing more
    setCursorPosition(target, start + 1)
    setState({ ...state, search: { ...state.search, type: null } })
  } else if (selection === '') {
    const newIdx = start + 1
    replaceSelectionWith(key + closePair)
    setCursorPosition(target, newIdx)

    if (state.str.local && state.str.local.length >= 4) {
      const fourChar = state.str.local?.substring(start - 1, start + 3),
        doubleBrackets = fourChar === '[[]]',
        type = doubleBrackets ? 'page' : null

      if (type) {
        setState({
          ...state,
          search: {
            type,
            query: '',
            results: [],
            index: null,
          },
        })
      }
    }
  } else if (selection !== '') {
    const surroundSelection = surround(selection, key)
    replaceSelectionWith(surroundSelection)
    setSelection(target, start + 1, end + 1)

    if (state.str.local && state.str.local.length >= 4) {
      const fourChar = state.str.local.substring(start - 1, start + 1) + state.str.local.substring(end + 1, end + 3),
        doubleBrackets = fourChar === '[[]]',
        type = doubleBrackets ? 'page' : null,
        queryFn = blockRepo.searchInNodeTitle

      if (type) {
        setState({
          ...state,
          search: {
            type,
            query: selection,
            results: queryFn(selection),
            index: null,
          },
        })
      }
    }
  }
}

function handleTab(event: KeyboardEvent, uid: string, state: BlockElState): void {
  event.preventDefault()

  const dKeyDown = destructKeyDown(event),
    { shift } = dKeyDown,
    rfdb = rfdbRepo.getValue(),
    { selectSubs, editing, currentRoute } = rfdb,
    localStr = state.str.local

  if (selectSubs === undefined || (selectSubs?.items && selectSubs.items.length === 0)) {
    if (editing?.uid) {
      if (shift) {
        events.unindent(editing.uid, dKeyDown, localStr ?? '', currentRoute?.uid ?? undefined)
      } else {
        events.indent(editing.uid, dKeyDown, localStr ?? '')
      }
    } else {
      console.error(editing)
    }
  }
}

/**
 * "When user types /, trigger slash menu.
  If user writes a character while there is a slash/type, update query and results."
 */
function writeChar(event: KeyboardEvent, _uid: string, state: BlockElState, setState: BlockElStateSetFn): void {
  const { head, key, value, start } = destructKeyDown(event),
    { type } = state.search,
    lookBehindChar = value.charAt(start - 1) ?? null

  if (key === ' ' && type === 'hashtag') {
    setState({
      ...state,
      search: {
        type: null,
        results: [],
        query: null,
        index: null,
      },
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
    setState({
      ...state,
      search: {
        type: 'hashtag',
        query: '',
        results: [],
        index: 0,
      },
    })
  } else if (key === ';' && lookBehindChar === ';' && type === null) {
    setState({
      ...state,
      search: {
        type: 'template',
        query: '',
        results: [],
        index: 0,
      },
    })
  } else if (type) {
    updateQuery(state, head, key, type)
  }
}

export function textareaKeyDown(
  event: KeyboardEvent,
  uid: string,
  editing: boolean,
  state: BlockElState,
  setState: BlockElStateSetFn,
) {
  if (editing) {
    const dEvent = destructKeyDown(event),
      { key, meta, ctrl } = dEvent

    setState({ ...state, lastKeydown: dEvent })

    if (state.search.type) {
      // const caretPosition = getCaretPosition(e.target)
      // setState({ ...state, caretPosition })
    }

    // ;; dispatch center
    // ;; only when nothing is selected or duplicate/events dispatched
    // ;; after some ops(like delete) can cause errors
    // if (selectSubs.items.length === 0) {
    if (arrowKeyDirection(event)) {
      handleArrowKey(event, uid, state)
    } else if (isPairChar(key)) {
      handlePairChar(event, uid, state, setState)
    } else if (key === 'Tab') {
      handleTab(event, uid, state)
    } else if (key === 'Enter') {
      handleEnter(event, uid, state)
    } else if (key === 'Backspace') {
      handleBackspace(event, uid, state, setState)
    } else if (key === 'Delete') {
      handleDelete(event, uid, state)
    } else if (key === 'Escape') {
      handleEscape(event, uid, state, setState)
      // } else if (shortcutKey(meta, ctrl)) {
      //   handleShortcuts(event, uid, state)
    } else if (isCharacterKey(dEvent)) {
      writeChar(event, uid, state, setState)
    }
  }
}
