import { difference, intersection, union } from 'lodash'
import * as events from '../events'
import { rfdbRepo } from '../stores/rfdb.repository'
import { getDatasetChildrenUid, getDatasetUid } from '../utils'

function getDescendantsUids(
  candidateUids: string[],
  uids_childrenUids: Record<string, string[] | null>,
) {
  let descendants: string[] = []
  const stack = candidateUids

  while (stack.length > 0) {
    const uid = stack.shift()
    if (uid === undefined) break

    // childrenUids can be undefined if not found
    const childrenUids = uids_childrenUids[uid]
    if (childrenUids) {
      descendants = descendants.concat(childrenUids)
      childrenUids.forEach((e) => stack.push(e))
    }
  }

  return descendants
}

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
  e: React.MouseEvent<HTMLTextAreaElement>,
  sourceUid: string,
  targetUid: string,
) {
  const { currentTarget: target } = e,
    page = target.closest('.node-page') ?? target.closest('.block-page')

  if (page) {
    const qBlockEls = page.querySelectorAll<HTMLElement>('.block-container'),
      blockEls = [...qBlockEls],
      uids = blockEls.map((e) => getDatasetUid(e)),
      childrenUids = blockEls.map((e) => getDatasetChildrenUid(e)),
      uids_childrenUids = Object.fromEntries(
        uids.map<[string, string[] | null]>((e, i) => [e, childrenUids[i]]),
      ),
      indexedUids = uids.map<[number, string]>((e, i) => [i, e]),
      startIndex = indexedUids.find(([_, uid]) => sourceUid === uid)?.[0],
      endIndex = indexedUids.find(([_, uid]) => targetUid === uid)?.[0]

    if (startIndex && endIndex) {
      const candidateUids = indexedUids
          ?.filter(
            ([i, uid]) =>
              Math.min(startIndex, endIndex) <= i &&
              i <= Math.max(startIndex, endIndex),
          )
          .map((e) => e[1]),
        descendantsUids = getDescendantsUids(candidateUids, uids_childrenUids),
        selectedUids = rfdbRepo.getValue().selection.items,
        toRemoveUids = intersection(selectedUids, descendantsUids),
        selectionNewUids = difference(candidateUids, descendantsUids),
        newSelectedUids = union(
          difference(selectedUids, toRemoveUids),
          selectionNewUids,
        ),
        selectionOrder = indexedUids
          .filter(([, v]) => newSelectedUids.includes(v))
          .map(([, v]) => v)

      if (selectionOrder) {
        events.selectionSetItems(selectionOrder)
      }
    }
  }
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

export function textareaBlur(
  event: React.ChangeEvent<HTMLTextAreaElement>,
  uid: string,
) {
  events.blockSave(uid, event.currentTarget.value)
}

export function textareaChange(
  event: React.ChangeEvent<HTMLTextAreaElement>,
  uid: string,
  // state: BlockElState,
  // setState: BlockElStateSetFn,
  // state: BlockElState,
  // setState: BlockElStateSetFn,
  // setStr: (s: string) => void,
  setLocalStr: (s: string) => void,
) {
  // setState({
  //   ...state,
  //   str: { ...state.str, local: event.target.value },
  // })
  // if (state.str.idleFn) {
  //   state.str.idleFn()
  // }

  // setStr(event.currentTarget.value)
  // events.blockSave(uid, event.currentTarget.value)

  setLocalStr(event.currentTarget.value)
}

/**
 * "If shift key is held when user clicks across multiple blocks, select the blocks."
 */
export function textareaClick(
  e: React.MouseEvent<HTMLTextAreaElement>,
  targetUid: string,
): void {
  const { shiftKey: shift } = e,
    sourceUid = rfdbRepo.getValue().editing?.uid

  if (shift && sourceUid && sourceUid !== targetUid) {
    findSelectedItems(e, sourceUid, targetUid)
  } else {
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
 */
export function textareaMouseDown(e: React.MouseEvent<HTMLTextAreaElement>) {
  e.stopPropagation()

  if (!e.shiftKey) {
    events.editingTarget(e.currentTarget)

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
 * @bug firefox, when mouse is down, 
 *      onMouseEnter event won't fire and jamed until mouse is up
 */
export function textareaMouseEnter(
  e: React.MouseEvent<HTMLTextAreaElement>,
  targetUid: string,
) {
  const {
    editing: { uid: sourceUid },
    mouseDown,
  } = rfdbRepo.getValue()

  if (mouseDown && sourceUid) {
    events.selectionClear()
    findSelectedItems(e, sourceUid, targetUid)
  }
}

/**
 * When textarea unmount, save local string to block
 */
export function textareaUnmount(uid: string, localStr: string) {
  events.blockSave(uid, localStr)
}
