import { KeyboardEvent } from 'react'
import { throttle } from 'rxjs'
import * as events from '../events'
import { blockRepo, getBlock } from '../stores/block.repository'
import { nextBlock } from '../op/queries'
import { rfdbRepo } from '../stores/rfdb.repository'
import { getDatasetChildrenUid, getDatasetUid, shortcutKey } from '../utils'
import { CaretPosition, DestructTextareaKeyEvent, Search } from '../interfaces'
import { getCaretCoordinates } from './textarea-caret'
import { MouseEvent } from 'react'

/**
 * "Used by both shift-click and click-drag for multi-block-selection.
  Given a mouse event, a source block, and a target block, highlight blocks.
  Find all blocks on the page using the DOM.
  Determine if direction is up or down.
  Algorithm: call select-up or select-down until start and end of vector are source and target.

  Bug: there isn't an algorithmic path for all pairs of source and target blocks, because sometimes the parent is
  highlighted, meaning a child block might not be selected itself. Rather, it inherits selection from parent.

  e.g.: 1 and 3 as source and target, or vice versa.
  • 1
  • 2
   • 3
  Because of this bug, add additional exit cases to prevent stack overflow."
 */
function findSelectedItems(
  event: MouseEvent,
  sourceUid: string,
  targetUid: string,
) {
  const target = event.target as HTMLElement,
    page = target.closest('.node-page') ?? target.closest('.block-page'),
    blockEls = page && page.querySelectorAll<HTMLElement>('.block-container'),
    uids = blockEls && [...blockEls].map((e) => getDatasetUid(e))
  // uids_childrenUids = zipmap(uids, blocks.map(getDatasetChildrenUids)),
  // uids_childrenUids = map(uids, blocks.map(getDatasetChildrenUids)),
  // uids_childrenUids = uids && uids.map(e => [e, getDatasetChildrenUid(el)]),

  // console.debug(page, blockEls, uids)

  //   indexedUids = uids.mapIndexed(vector),
  //   startIndex = indexedUids.filter((_idx, uid) => sourceUid === uid),
  //   endIndex = indexedUids.filter((_idx, uid) => targetUid === uid),
  //   selectedUids = subscribe('select-subs/items'),
  //   candidateUids = indexedUids.filter(
  //     (idx, _uid) =>
  //       Math.min(startIndex, endIndex) <= idx <= Math.max(startIndex, endIndex),
  //   ),
  //   descendantUids = loop(),
  //   toRemoveUids = set.intersect(selectedUids, descendantUids),
  //   selectionNewUids = set.difference(candidateUids, descendantUids),
  //   newSelectedUids = set.union(
  //     set.difference(selectedUids, toRemoveUids),
  //     selectionNewUids,
  //   ),
  //   selectionOrder = indexedUids
  //     .filter((_k, v) => newSelectedUids.contains(v))
  //     .mapv('second')

  // if (startIndex && endIndex) {
  //   dispatchEvent('select-events/set-items', selectionOrder)
  // }
}

// const textareaPaste = (e, _uid, state) => {
//   const data = e.clipboardData,
//     textData = data.getData('text/plain'),
//     internalPresentation = data.getData('application/athens-representation'),
//     // internal representation
//     internal = seq(internalPresentation),
//     newUids = newUidsMap(internalPresentation),
//     reprWithNewUids = updateUids(internalPresentation, newUids),
//     // images in clipboard
//     items = arraySeq(e.clipboardData.items),
//     { head, tail } = destructTarget(e.target),
//     imgRegex = /#"(?i)^image\/(p?jpeg|gif|png)$"/,
//     callback = () => {},
//     // external to internal representation
//     textToInter = textData !== '' && textToInternalPresentation(textData),
//     lineBreaks = reFind(/\r?\n/, textData),
//     noShift = state.lastKeydown !== 'shift'

//   if (internal) {
//     e.preventDefaul()
//     dispatchEvent('paste-internal', uid, state.string.local, reprWithNewUids)
//   } else if (seq(filter())) {
//     // For images
//   } else if (lineBreaks && noShift) {
//     e.preventDefaul()
//     dispatchEvent('paste-internal', uid, state.string.local, textToInter)
//   } else if (noShift) {
//     e.preventDefaul()
//     dispatchEvent('paste-verbatim', uid, textData)
//   }
// }

export function textareaChange(
  event: React.ChangeEvent<HTMLTextAreaElement>,
  uid: string,
  // state: BlockElState,
  // setState: BlockElStateSetFn,
  // state: BlockElState,
  // setState: BlockElStateSetFn,
  // setStr: (s: string) => void,
) {
  // setState({
  //   ...state,
  //   str: { ...state.str, local: event.target.value },
  // })
  // if (state.str.idleFn) {
  //   state.str.idleFn()
  // }
  // setStr(event.currentTarget.value)
  events.blockSave(uid, event.currentTarget.value)
}

/**
 * "If shift key is held when user clicks across multiple blocks, select the blocks."
 */
export function textareaClick(event: MouseEvent, targetUid: string): void {
  const shift = event.shiftKey,
    sourceUid = rfdbRepo.getValue().editing?.uid

  if (shift && sourceUid && sourceUid !== targetUid) {
    findSelectedItems(event, sourceUid, targetUid)
    events.selectionClear()
  }
}

function globalMouseup() {
  document.removeEventListener('mouseup', globalMouseup)
  events.mouseDownUnset()
}

/**
 * * "Attach global mouseup listener. Listener can't be local because user might let go of mousedown off of a block.
    See https://javascript.info/mouse-events-basics#events-order"
 * 
 *
 */
export function textareaMouseDown(e: MouseEvent) {
  e.stopPropagation()
  if (!e.shiftKey) {
    events.editingTarget(e.target as HTMLTextAreaElement)

    const { mouseDown } = rfdbRepo.getValue()
    if (!mouseDown) {
      events.mouseDownSet()
      document.addEventListener('mouseup', globalMouseup)
    }
  }
}

/**
 * "When mouse-down, user is selecting multiple blocks with click+drag.
    Use same algorithm as shift-enter, only updating the source and target."
 * 
 * @bug firefox only, when current mouse is down, onMouseEnter event won't fire and jamed until mouse is up
 */
export function textareaMouseEnter(e: MouseEvent, targetUid: string) {
  const {
    editing: { uid: sourceUid },
    mouseDown,
  } = rfdbRepo.getValue()

  if (mouseDown && sourceUid) {
    events.selectionClear()
    findSelectedItems(e, sourceUid, targetUid)
  }
}
