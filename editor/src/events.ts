import { editingFocus, navigate, setCursorPosition } from './effects'
import { Block, DestructTextareaKeyEvent, Position, PositionRelation } from './interfaces'
import * as ops from './op/ops'
import { compatPosition } from './op/helpers'
import { blockRepo, blocksStore, getBlock, getBlockChildren } from './stores/block.repository'
import { rfdbRepo } from './stores/rfdb.repository'
import { genBlockUid } from './utils'
import { isInteger, isNumber } from 'lodash'

function blockSaveBlockMoveCompositeOp(sourceUid: string, refUid: string, relation: PositionRelation, str: string) {
  const location = compatPosition({ blockUid: refUid, relation })

  // TODO: composite ops
  ops.blockSaveOp(sourceUid, str)
  ops.blockMoveOp(sourceUid, location)
}

function getPrevSiblingBlockAndTargetRel(block: Block): [Block | null, PositionRelation] {
  const parent = block.parentUid ? getBlock(block.parentUid) : null,
    prevSib = parent && getNthSiblingBlock(block, parent, -1),
    targetRel = prevSib && prevSib.childrenUids.length > 0 ? 'last' : 'first'
  return [prevSib, targetRel]
}

export function up(uid: string, targetPos: number | 'end') {
  const block = getBlock(uid),
    parent = block.parentUid && getBlock(block.parentUid),
    prev = parent && getPrevBlock(block, parent),
    editingUid = prev ? prev.uid : uid
  console.debug(block, parent, prev, blocksStore.getValue())
  editingUid(editingUid, targetPos)
}

export function down(uid: string, targetPos: number | 'end') {
  const block = getBlock(uid),
    next = block && getNextBlock(block),
    editingUid = next ? next.uid : uid
  editingUid(editingUid, targetPos)
}

/**
 * "If root and 0th child, 1) if value, no-op, 2) if blank value, delete only block.
No-op if parent is missing.
No-op if parent is prev-block and block has children.
No-op if prev-sibling-block has children.
Otherwise delete block and join with previous block
If prev-block has children"
 * 
 */
export function backspace(uid: string, value: string, maybeLocalUpdates?: string) {
  // const rootEmbed = false,
  // [uid, embedId] = uidAndEmbedId(_uid),
  const block = getBlock(uid),
    { order, parentUid } = block,
    children = getBlockChildren(uid),
    parent = parentUid ? getBlock(parentUid) : null,
    prev = parent && getPrevBlock(block, parent),
    prevSib = parent && getNthSiblingBlock(block, parent, -1)

  if (
    parent === null ||
    (children.length > 0 && prevSib && prevSib.childrenUids.length > 0) ||
    (children.length > 0 && parent === prev)
  ) {
    return
  }
  if (children.length === 0 && parent.nodeTitle && order === 0 && value === '') {
    backspaceDeleteOnlyChild(uid)
    return
  }
  if (prev && maybeLocalUpdates) {
    backspaceDeleteMergeBlockWithSave(uid, value, prev, maybeLocalUpdates)
    return
  }
  if (prev) {
    backspaceDeleteMergeBlock(uid, value, prev)
  }
  console.error({ block, value, maybeLocalUpdates, children, parent, prev, prevSib })
  throw new Error('backspace::unhandled situation')
}

/**
 * "- If block is open, has children, and caret at end, create new child
- If block is CLOSED, has children, and caret at end, add a sibling block.
- If value is empty and a root block, add a sibling block.
- If caret is not at start, split block in half.
- If block has children and is closed, if at end, just add another child.
- If block has children and is closed and is in middle of block, split block.
- If value is empty, unindent.
- If caret is at start and there is a value, create new block below but keep same block index."
 */
export function enter(uid: string, dKeyDown: DestructTextareaKeyEvent) {
  const block = getBlock(uid),
    hasChildren = block.childrenUids.length > 0,
    parent = block.parentUid && getBlock(block.parentUid),
    rootBlock = (parent && parent.pageTitle) !== undefined,
    // contextRootUid = rfdbRepo.currentRoute.pathParams.id,  // contextRoot: the block opened as root
    contextRootUid = undefined,
    newUid = genBlockUid(),
    { value, start } = dKeyDown,
    caretAtEnd = value.length === start,
    valueEmpty = value.length === 0

  if (block.open && hasChildren && caretAtEnd) {
    enterAddChild(block, newUid)
  } else if (!block.open && hasChildren && caretAtEnd && parent) {
    enterNewBlock(block, parent, newUid)
  } else if ((valueEmpty || rootBlock) && parent) {
    enterNewBlock(block, parent, newUid)
  } else if (block.open && !caretAtEnd) {
    enterSplitBlock(block, newUid, value, start, 'first')
  } else if (start !== 0) {
    enterSplitBlock(block, newUid, value, start, 'after')
  } else if (valueEmpty) {
    unindent(uid, dKeyDown, '', contextRootUid)
  } else if (start === 0 && value) {
    enterBumpUp(block, newUid)
  } else {
    console.debug('[enter] ->', { uid, dKeyDown, block, parent })
    throw new Error('[enter]')
  }
}

/**
 * ;; - `block-zero`: The first block in a page
  ;; - `value`     : The current string inside the block being indented. Otherwise, if user changes block string and indents,
  ;;                 the local string  is reset to original value, since it has not been unfocused yet (which is currently the
  ;;                 transaction that updates the string).
  // if sibling block is closed with children, open
 */
export function indent(uid: string, dKeyDown: DestructTextareaKeyEvent, localStr: string) {
  const block = getBlock(uid),
    blockZero = block.order === 0,
    [sibBlock, targetRel] = getPrevSiblingBlockAndTargetRel(block)

  if (sibBlock && !blockZero) {
    const sibClosed = !sibBlock.open && sibBlock.childrenUids.length > 0,
      sibBlockOpenOp = sibClosed && blockRepo.blockOpenOp(sibBlock.uid, true),
      { start, end } = dKeyDown,
      blockSaveBlockMoveOp = blockSaveBlockMoveCompositeOp(uid, sibBlock.uid, targetRel, localStr)

    if (sibBlockOpenOp) {
      blockRepo.update([blockSaveBlockMoveOp, sibBlockOpenOp])
    } else {
      blockRepo.update([blockSaveBlockMoveOp])
    }
  }
}

export function unindent(uid: string, dKeyDown: DestructTextareaKeyEvent, localStr: string, contextRootUid?: string) {
  const block = getBlock(uid),
    parent = block.parentUid ? getBlock(block.parentUid) : null,
    doNothing = parent === null || parent.pageTitle !== null || contextRootUid === parent.uid,
    { start, end } = dKeyDown

  // async flow
  blockSaveBlockMoveCompositeOp(uid, parent.uid, 'after', localStr)
  editingUid(uid)
  setCursorPosition(uid, start, end)
}

// Backspace Events

export function backspaceDeleteMergeBlock(uid: string, value: string, prevBlock: Block) {
  // async flow
  blockRepo.blockRemoveMergeOp(uid, prevBlock.uid, value)
  // focusOnUid(prevBlock.uid, prevBlock.str.length)
  events.editingUid(uid, prevBlock.str.length)
}

export function backspaceDeleteMergeBlockWithSave(uid: string, value: string, prevBlock: Block, localUpdate?: string) {
  // async flow
  blockRepo.blockMergeWithUpdateOp(uid, prevBlock.uid, value, localUpdate)
  // focusOnUid(prevBlock.uid, localUpdate?.length)
  events.editingUid(uid, localUpdate?.length)
}

export function backspaceDeleteOnlyChild(uid: string) {
  blockRepo.blockRemoveOp(uid)
  editingUid(null)
}

// Block events

export function blockMove(sourceUid: string, targetUid: string, targetRel: PositionRelation) {
  const block = getBlock(sourceUid)
  blockRepo.update(ops.blockMoveOp(block, { blockUid: targetUid, relation: targetRel }))
}

export function blockOpen(uid: string, open: boolean) {
  ops.blockOpenOp(uid, open)
}

export function blockSave(uid: string, str: string) {
  const block = getBlock(uid),
    doNothing = block.str === str

  if (block.pageTitle) {
    throw new Error('blockSave::node-block not allow to change string')
  }
  if (!doNothing) {
    ops.blockSaveOp(uid, str)
  }
}

// Drop Events

export function dropMultiChild(sourceUids: string[], targetUid: string) {
  ops.blockMoveChain(targetUid, sourceUids, 'first')
}

/**
 * ;; When the selected blocks have same parent and are DnD under the same parent this event is fired.
    ;; This also applies if on selects multiple Zero level blocks and change the order among other Zero level blocks.
 */
export function dropMultiSiblings(sourceUids: string[], targetUid: string, dragTarget: PositionRelation) {
  ops.blockMoveChain(targetUid, sourceUids, dragTarget)
}

// Editing Events

export function editingTarget(target: HTMLTextAreaElement) {
  const uid = target.id.split('editable-uid-')[1]
  editingUid(uid)
}

export function editingUid(uid: string | null, cursorAnchor?: number | 'end') {
  rfdbRepo.updateEditingUid(uid)
  editingFocus(uid, cursorAnchor)
}

// Enter Events

export function enterAddChild(block: Block, newUid: string) {
  const position = compatPosition({ blockUid: block.uid, relation: 'first' }),
    op = ops.blockNewOp(newUid, position)
  blockRepo.update(op)
  editingUid(newUid)
}

export function enterBumpUp(block: Block, newUid: string) {
  const position = compatPosition({ blockUid: block.uid, relation: 'before' }),
    op = ops.blockNewOp(newUid, position)
  blockRepo.update(op)
  editingUid(newUid)
}

export function enterNewBlock(block: Block, parent: Block, newUid: string) {
  const op = ops.blockNewOp(newUid, { blockUid: block.uid, relation: 'after' })
  blockRepo.update(op)
  editingUid(newUid)
}

export function enterSplitBlock(
  block: Block,
  newUid: string,
  value: string,
  index: number,
  relation: PositionRelation,
) {
  const op = ops.blockSplitOp(block, newUid, value, index, relation)
  blockRepo.update(op)
  editingUid(newUid)
}

/**
 * ;; Triggered when there is a closed embeded block with no content in the top level block
  ;; and then one presses enter in the embeded block.
 */
function enterOpenBlockAddChild() {}

// Mouse Events

export function mouseDownSet() {
  rfdbRepo.updateMouseDown(true)
}

export function mouseDownUnset() {
  rfdbRepo.updateMouseDown(false)
}

// Page Events

function pageMerge() {}

export function pageNew(title: string, blockUid: string, shift?: true) {
  blockRepo.pageNewOp(title, blockUid)
  pageNewFollowup(title, shift)
  editingUid(blockUid)
}

export function pageNewFollowup(title: string, shift?: true) {
  const pageUid = blockRepo.getPageUid(title)
  if (shift) {
    // rightSidebarOpenItem(pageUid)
  } else {
    navigate({ page: { id: pageUid } })
  }
}

function pageRename(oldName: string, newName: string, callback: () => void) {
  blockRepo.renamePage(oldName, newName)
  callback()
}

// Selction Events

export function selectionSetItems(uids: string[]) {
  rfdbRepo.updateSelectionItems(uids)
}

export function selectionAddItem(uid: string, position: number | 'first' | 'last') {
  const selectedItems = rfdbRepo.getValue().selection.items,
    selectedCount = selectedItems.length

  if (position === 'last') {
    rfdbRepo.updateSelectionItems([...selectedItems, uid])
  } else if (position === 'first') {
    rfdbRepo.updateSelectionItems([uid, ...selectedItems])
  } else if (isInteger(position)) {
    if (0 <= position && position <= selectedCount) {
      const newSelectedItems = [
        ...selectedItems.slice(0, position),
        uid,
        ...selectedItems.slice(position, selectedCount),
      ]
      rfdbRepo.updateSelectionItems([...newSelectedItems, uid])
    } else {
      console.error('[selectionAddItem] Invalid insert position', position, uid, selectedItems)
    }
  }
}

export function selectionDelete() {}

export function selectionClear() {}
