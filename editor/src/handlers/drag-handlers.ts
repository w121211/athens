import { DragEvent } from 'react'
import { rfdbRepo } from '../stores/rfdb.repository'
import { getDatasetUid, mouseOffset, verticalCenter } from '../utils'
import type { Block, BlockElState, BlockElStateSetFn, DragTarget } from '../interfaces'
import * as events from '../events'

type ActionAllowed = 'link' | 'move'

/**
 * "Terminology :
    - source-uid        : The block which is being dropped.
    - target-uid        : The block on which source is being dropped.
    - drag-target       : Represents where the block is being dragged. It can be `:first` meaning
                          dragged as a child, `:before` meaning the source block is dropped above the
                          target block, `:after` meaning the source block is dropped below the target block.
    - action-allowed    : There can be 2 types of actions.
        - `link` action : When a block is DnD by dragging a bullet while
                         `shift` key is pressed to create a block link.
        - `move` action : When a block is DnD to other part of Athens page. "
 */
function dropBullet(sourceUid: string, targetUid: string, dragTarget: DragTarget, actionAllowed: ActionAllowed) {
  if (actionAllowed === 'move') {
    events.blockMove(sourceUid, targetUid, dragTarget)
  }
}

/**
 * Terminology :
    - source-uids       : Uids of the blocks which are being dropped
    - target-uid        : Uid of the block on which source is being dropped"
 */
function dropBulletMulti(sourceUids: string[], targetUid: string, dragTarget: DragTarget) {
  if (dragTarget === 'first') {
    events.selectionClear()
    events.dropMultiChild(sourceUids, targetUid)
  } else {
    events.selectionClear()
    events.dropMultiSiblings(sourceUids, targetUid, dragTarget)
  }
}

/**
 *
 */
export function blockDragLeave(event: DragEvent, block: Block, state: BlockElState, setState: BlockElStateSetFn) {
  event.preventDefault()
  event.stopPropagation()
  const { uid: targetUid } = block,
    relatedUid = event.relatedTarget instanceof HTMLElement ? getDatasetUid(event.relatedTarget) : null

  if (relatedUid !== targetUid) {
    // swap(state, { dragTarget: null })
    setState({ ...state, dragTarget: null })
  }
}

/**
 * "If block or ancestor has CSS dragging class, do not show drop indicator; do not allow block to drop onto itself.
  If above midpoint, show drop indicator above block.
  If no children and over X pixels from the left, show child drop indicator.
  If below midpoint, show drop indicator below."
 */
export function blockDragOver(event: DragEvent, block: Block, state: BlockElState, setState: BlockElStateSetFn) {
  event.preventDefault()
  event.stopPropagation()

  const { childrenUids, uid, open } = block,
    closestContainer = (event.target as HTMLElement).closest('.block-container'),
    offset = closestContainer && mouseOffset(event, closestContainer),
    middleY = closestContainer && verticalCenter(closestContainer),
    draggingAncestor = (event.target as HTMLElement).closest('.dragging'),
    isSelected = rfdbRepo.getIsSelected(uid)

  let target: 'first' | 'before' | 'after' | null = null
  if (draggingAncestor) {
    target = null
  } else if (isSelected) {
    target = null
  } else if (offset && middleY && (offset.y < 0 || offset.y < middleY)) {
    target = 'before'
  } else if (offset && (!open || (childrenUids.length === 0 && 50 < offset.x))) {
    target = 'first'
  } else if (offset && middleY && middleY < offset.y) {
    target = 'after'
  }

  if (target) {
    setState({ ...state, dragTarget: target })
  }
}

/**
 * "Handle dom drop events, read more about drop events at:
  : https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#Define_a_drop_zone"
 */
export function blockDrop(event: DragEvent, block: Block, state: BlockElState, setState: BlockElStateSetFn) {
  event.stopPropagation()

  const { uid: targetUid } = block,
    { dragTarget } = state,
    sourceUid = event.dataTransfer.getData('text/plain'),
    effectAllowed = event.dataTransfer.effectAllowed,
    items = event.dataTransfer.items,
    item = items[0],
    datatype = item.type,
    // imgRgex = /(?i)^image\/(p?jpeg|gif|png)$/,
    validTextDrop = dragTarget && sourceUid !== targetUid && effectAllowed === 'move',
    selectedItem = rfdbRepo.getValue().selection.items

  // if (reFind(imgRgex, datatype)) { }
  // else
  if (datatype.includes('text/plain')) {
    if (validTextDrop) {
      if (selectedItem.length === 0) {
        dropBullet(sourceUid, targetUid, dragTarget, effectAllowed)
      } else {
        dropBulletMulti(selectedItem, targetUid, dragTarget)
      }
    }
  }

  events.mouseDownUnset()
  setState({
    ...state,
    dragTarget: null,
  })
}
