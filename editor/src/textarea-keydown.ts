import { useObservable } from '@ngneat/react-rxjs'
import dynamic from 'next/dynamic'
import { KeyboardEvent } from 'react'
import { throttle } from 'rxjs'
import { events } from './events'
import { rfdbRepo } from './stores/rfdb.repository'
import { shortcutKey } from './utils'
import { BlockElState } from './components/block/block-el'

// function getText(textfield: HTMLTextAreaElement): string {
//   const s = textfield.value
//   return s.substring(textfield.selectionStart, textfield.selectionEnd)
// }

export type DestructTextareaKeyEvent = {
  value: string
  start: number
  end: number
  head: string
  tail: string
  selection: string
  key: string
  keyCode: number
  target: HTMLTextAreaElement
  shift: boolean
  meta: boolean
  ctrl: boolean
  alt: boolean
}

// const arrowKeyDirection = () => {
// }

// const isBlockStart = () => {

// }

// const isBlockEnd = () => {

// }

// Helpers

function modifierKeys(e: KeyboardEvent) {
  return {
    shift: e.shiftKey,
    meta: e.metaKey,
    ctrl: e.ctrlKey,
    alt: e.altKey,
  }
}

/**
 * "Get the current value of a textarea (`:value`) and
   the start (`:start`) and end (`:end`) index of the selection.
   Furthermore, split the selection into three parts:
   text before the selection (`:head`),
   the selection itself (`:selection`),
   and text after the selection (`:tail`)."
 */
function destructTarget(target: HTMLTextAreaElement) {
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
    // { restuls, type, index } = state.search,
    // { caretPosition } = state,
    textareaHeight = target.offsetHeight, // this height is accurate, but caret-position height is not updating
    // { top, height } = caretPosition,
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

function handleEscape(e: KeyboardEvent, uid: string, state: BlockElState) {}

function handleTab(e: KeyboardEvent, uid: string, state: BlockElState) {
  e.preventDefault()

  const dKeyDown = destructKeyDown(e),
    { shift } = dKeyDown,
    rfdb = rfdbRepo.getValue(),
    { selectSubs, editing, currentRoute } = rfdb,
    localStr = state.string.local

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

// ---

/**
 * "When user types /, trigger slash menu.
  If user writes a character while there is a slash/type, update query and results."
 */
function writeChar(e, _uid, state) {
  const { head, key, value, start } = destructKeyDown(e),
    { type } = state.search,
    lookBehindChar = value.charAt(start - 1)
  if (key === ' ' && type === 'hashtag') {
    setState({ ...state, search: { type: null, results: [] } })
  } else if (key === '/' && type === null) {
    setState({ ...state, search: { type: null, results: [] } })
  } else if (key === '#' && type === null) {
    setState({ ...state, search: { type: null, results: [] } })
  } else if (key === ';' && lookBehindChar === ';' && type === null) {
    setState({ ...state, search: { type: null, results: [] } })
  } else if (type) {
    updateQuery(state, head, key, type)
  }
}

export function textareaKeyDown(e: KeyboardEvent, uid: string, state: BlockElState, editing: boolean) {
  if (editing) {
    const dEvent = destructKeyDown(e),
      { meta, ctrl, key } = dEvent

    // setState({ state, lastKeydown: dEvent })

    // if (state.search.type) {
    //   const caretPosition = getCaretPosition(e.target)
    //   setState({ ...state, caretPosition })
    // }

    // if (selectSubs.items.length === 0) {
    if (arrowKeyDirection(e)) {
      handleArrowKey(e, uid, state)
      //   } else if (pairChar(e)) {
      //     handlePairChar(e, uid, state)
    } else if (key === 'Tab') {
      handleTab(e, uid, state)
    } else if (key === 'Enter') {
      handleEnter(e, uid, state)
      //   } else if (key === 'Backspace') {
      //     handleBackspace(e, uid, state)
      //   } else if (key === 'Delete') {
      //     handleDelete(e, uid, state)
      //   } else if (key === 'Escape') {
      //     handleEscape(e, uid, state)
      //   } else if (shortcutKey(meta, ctrl)) {
      //     handleShortcuts(e, uid, state)
      //   } else if (isCharacterKey(e)) {
      //     writeChar(e, uid, state)
      //   }
    }
  }
}
