import { editingFocus, setCursorPosition } from './effects'
import {
  Block,
  DestructTextareaKeyEvent,
  BlockPositionRelation,
  Doc,
} from './interfaces'
import * as ops from './op/ops'
import { areSameParent, compatPosition } from './op/helpers'
import {
  BlockReducer,
  blockRepo,
  getBlock,
  getBlockChildren,
} from './stores/block.repository'
import { rfdbRepo } from './stores/rfdb.repository'
import { genBlockUid } from './utils'
import { isInteger } from 'lodash'
import { nextBlock, nthSiblingBlock, prevBlock } from './op/queries'
import { docRepo, getDoc } from './stores/doc.repository'
import { draftService } from './services/draft.service'
import { editorRepo } from './stores/editor.repository'
import { noteService } from './services/note.service'

//
// Key-down Events
//
//
//
//
//
//

export function up(uid: string, targetPos: number | 'end') {
  const block = getBlock(uid),
    parent = block.parentUid && getBlock(block.parentUid),
    prev = parent && prevBlock(block, parent),
    _editingUid = prev ? prev.uid : uid
  editingUid(_editingUid, targetPos)
}

export function down(uid: string, targetPos: number | 'end') {
  const block = getBlock(uid),
    next = block && nextBlock(block),
    _editingUid = next ? next.uid : uid
  editingUid(_editingUid, targetPos)
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
export function backspace(
  uid: string,
  value: string,
  maybeLocalUpdates?: string,
) {
  // const rootEmbed = false,
  // [uid, embedId] = uidAndEmbedId(_uid),
  const block = getBlock(uid),
    { order, parentUid } = block,
    children = getBlockChildren(uid),
    parent = parentUid ? getBlock(parentUid) : null,
    prev = parent && prevBlock(block, parent),
    prevSib = parent && nthSiblingBlock(block, parent, -1)

  if (
    parent === null ||
    (children.length > 0 && prevSib && prevSib.childrenUids.length > 0) ||
    (children.length > 0 && parent === prev)
  ) {
    return
  }
  if (children.length === 0 && parent.docTitle && order === 0 && value === '') {
    backspaceDeleteOnlyChild(block)
    return
  }
  if (prev && maybeLocalUpdates) {
    backspaceDeleteMergeBlockWithSave(block, value, prev, maybeLocalUpdates)
    return
  }
  if (prev) {
    backspaceDeleteMergeBlock(block, value, prev)
    return
  }
  console.error({
    block,
    value,
    maybeLocalUpdates,
    children,
    parent,
    prev,
    prevSib,
  })
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
    parentIsRootBlock = (parent && parent.docTitle) !== undefined,
    // contextRootUid = rfdbRepo.currentRoute.pathParams.id,  // contextRoot: the block opened as root
    contextRootUid = undefined,
    newUid = genBlockUid(),
    { value, start } = dKeyDown,
    caretAtEnd = value.length === start,
    valueEmpty = value.length === 0

  if (block.open && hasChildren && caretAtEnd) {
    enterAddChild(block, newUid)
  } else if (!block.open && hasChildren && caretAtEnd && parent) {
    enterNewBlock(block, newUid)
  } else if (valueEmpty && parentIsRootBlock) {
    enterNewBlock(block, newUid)
  } else if (block.open && !caretAtEnd) {
    enterSplitBlock(block, newUid, value, start, 'first')
  } else if (start !== 0) {
    enterSplitBlock(block, newUid, value, start, 'after')
  } else if (valueEmpty) {
    unindent(uid, dKeyDown, '', contextRootUid)
  } else if (start === 0 && value) {
    enterBumpUp(block, newUid)
  } else {
    console.debug('[enter]', { uid, dKeyDown, block, parent })
    throw new Error('[enter]')
  }
}

function blockSaveBlockMoveCompositeOp(
  sourceBlock: Block,
  refUid: string,
  relation: BlockPositionRelation,
  str: string,
): [BlockReducer[], BlockReducer[]] {
  const location = compatPosition({ refBlockUid: refUid, relation })
  return [
    ops.blockSaveOp(sourceBlock.uid, str),
    ops.blockMoveOp(sourceBlock, location),
  ]
}

function getPrevSiblingBlockAndTargetRel(
  block: Block,
): [Block | null, BlockPositionRelation] {
  const parent = block.parentUid ? getBlock(block.parentUid) : null,
    prevSib = parent && nthSiblingBlock(block, parent, -1),
    targetRel = prevSib && prevSib.childrenUids.length > 0 ? 'last' : 'first'
  return [prevSib, targetRel]
}

/**
 * ;; - `block-zero`: The first block in a page
  ;; - `value`     : The current string inside the block being indented. Otherwise, if user changes block string and indents,
  ;;                 the local string  is reset to original value, since it has not been unfocused yet (which is currently the
  ;;                 transaction that updates the string).
  // if sibling block is closed with children, open
 */
export function indent(
  uid: string,
  dKeyDown: DestructTextareaKeyEvent,
  localStr: string,
) {
  const block = getBlock(uid),
    blockZero = block.order === 0,
    [sib, rel] = getPrevSiblingBlockAndTargetRel(block)

  if (sib && !blockZero) {
    const sibClose = !sib.open && sib.childrenUids.length > 0,
      sibOpenOp = sibClose && ops.blockOpenOp(sib.uid, true),
      { start, end } = dKeyDown,
      [saveOp, moveOp] = blockSaveBlockMoveCompositeOp(
        block,
        sib.uid,
        rel,
        localStr,
      )

    if (sibOpenOp) {
      blockRepo.update([...saveOp, ...moveOp, ...sibOpenOp])
    } else {
      blockRepo.update([...saveOp, ...moveOp])
    }
    setCursorPosition(uid, start, end)
  }
}

export function indentMulti(uids: string[]) {
  const blocks = uids.map((e) => getBlock(e)),
    firstBlock = blocks[0],
    firstBlockOrder = firstBlock.order,
    blockZero_ = firstBlockOrder === 0,
    [prevBlock, targetRel] = getPrevSiblingBlockAndTargetRel(firstBlock),
    sameParent_ = areSameParent(blocks)

  if (sameParent_ && !blockZero_ && prevBlock) {
    dropMultiSiblings(uids, prevBlock.uid, targetRel)
  }
}

export function unindent(
  uid: string,
  dKeyDown: DestructTextareaKeyEvent,
  localStr: string,
  contextRootUid?: string,
) {
  const block = getBlock(uid),
    parent = block.parentUid ? getBlock(block.parentUid) : null,
    // doNothing =
    //   parent === null ||
    //   parent.pageTitle !== null ||
    //   contextRootUid === parent.uid,
    { start, end } = dKeyDown

  if (parent && parent.docTitle === undefined) {
    const [saveOp, moveOp] = blockSaveBlockMoveCompositeOp(
      block,
      parent.uid,
      'after',
      localStr,
    )
    blockRepo.update([...saveOp, ...moveOp])

    editingUid(uid)
    setCursorPosition(uid, start, end)
  }
}

export function unindentMulti(uids: string[]) {
  const blocks = uids.map((e) => getBlock(e)),
    firstBlock = blocks[0],
    parent = firstBlock.parentUid ? getBlock(firstBlock.parentUid) : null,
    sameParent_ = areSameParent(blocks)

  if (parent && parent.docTitle === undefined && sameParent_) {
    dropMultiSiblings(uids, parent.uid, 'after')
  }
}

//
// Backspace Events
//
//
//
//
//
//

export function backspaceDeleteMergeBlock(
  block: Block,
  value: string,
  prevBlock: Block,
) {
  blockRepo.updateChain(ops.blockMergeChainOp(block, prevBlock, value))
  editingUid(prevBlock.uid, prevBlock.str.length)
}

export function backspaceDeleteMergeBlockWithSave(
  block: Block,
  // uid: string,
  value: string,
  prevBlock: Block,
  localUpdate?: string,
) {
  blockRepo.updateChain(
    ops.blockMergeWithUpdatedChainOp(block, prevBlock, value, localUpdate),
  )
  editingUid(prevBlock.uid, localUpdate?.length)
}

export function backspaceDeleteOnlyChild(block: Block) {
  blockRepo.update(ops.blockRemoveOp(block))
  editingUid(null)
}

//
// Block Events
//
//
//
//
//
//

export function blockMove(
  sourceUid: string,
  targetUid: string,
  targetRel: BlockPositionRelation,
) {
  const block = getBlock(sourceUid)
  blockRepo.update(
    ops.blockMoveOp(block, { refBlockUid: targetUid, relation: targetRel }),
  )
}

export function blockOpen(uid: string, open: boolean) {
  blockRepo.update(ops.blockOpenOp(uid, open))
}

export function blockSave(uid: string, str: string) {
  const block = getBlock(uid),
    doNothing = block.str === str

  if (block.docTitle) {
    throw new Error('[blockSave] doc-block not allow to change string')
  }
  if (!doNothing) {
    blockRepo.update(ops.blockSaveOp(uid, str))
  }
}

//
// Drop Events
//
//
//
//
//
//

export function dropMultiChild(sourceUids: string[], targetUid: string) {
  blockRepo.updateChain(ops.blockMoveChainOp(targetUid, sourceUids, 'first'))
}

/**
 * ;; When the selected blocks have same parent and are DnD under the same parent this event is fired.
    ;; This also applies if on selects multiple Zero level blocks and change the order among other Zero level blocks.
 */
export function dropMultiSiblings(
  sourceUids: string[],
  targetUid: string,
  dragTarget: BlockPositionRelation,
) {
  blockRepo.updateChain(ops.blockMoveChainOp(targetUid, sourceUids, dragTarget))
}

//
// Editing Events
//
//
//
//
//
//

export function editingTarget(target: HTMLTextAreaElement) {
  const uid = target.id.split('editable-uid-')[1]
  editingUid(uid)
}

export function editingUid(uid: string | null, cursorAnchor?: number | 'end') {
  rfdbRepo.updateEditingUid(uid)
  editingFocus(uid, cursorAnchor)
}

//
// Enter Events
//
//
//
//
//
//

export function enterAddChild(block: Block, newUid: string) {
  const position = compatPosition({
      refBlockUid: block.uid,
      relation: 'first',
    }),
    op = ops.blockNewOp(newUid, position)
  blockRepo.update(op)
  editingUid(newUid)
}

export function enterBumpUp(block: Block, newUid: string) {
  const position = compatPosition({
      refBlockUid: block.uid,
      relation: 'before',
    }),
    op = ops.blockNewOp(newUid, position)
  blockRepo.update(op)
  editingUid(newUid)
}

// export function enterNewBlock(block: Block, parent: Block, newUid: string) {
export function enterNewBlock(block: Block, newUid: string) {
  blockRepo.update(
    ops.blockNewOp(newUid, { refBlockUid: block.uid, relation: 'after' }),
  )
  editingUid(newUid)
}

export function enterSplitBlock(
  block: Block,
  newUid: string,
  value: string,
  index: number,
  relation: BlockPositionRelation,
) {
  blockRepo.updateChain(
    ops.blockSplitChainOp(block, newUid, value, index, relation),
  )
  editingUid(newUid)
}

/**
 * ;; Triggered when there is a closed embeded block with no content in the top level block
  ;; and then one presses enter in the embeded block.
 */
// function enterOpenBlockAddChild() {}

//
// Mouse Events
//
//
//
//
//
//

export function mouseDownSet() {
  rfdbRepo.updateMouseDown(true)
}

export function mouseDownUnset() {
  rfdbRepo.updateMouseDown(false)
}

//
// Search Events
//
//
//
//
//
//

export function search(uids: string[]) {}

//
// Selction Events
//
//
//
//
//
//

export function selectionSetItems(uids: string[]) {
  rfdbRepo.updateSelectionItems(uids)
}

export function selectionAddItem(
  uid: string,
  position: number | 'first' | 'last',
) {
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
      console.error(
        '[selectionAddItem] Invalid insert position',
        position,
        uid,
        selectedItems,
      )
    }
  }
}

export function selectionDelete() {
  const selectedUids = rfdbRepo.getValue().selection.items,
    chain = ops.blockRemoveManyChainOp(selectedUids)

  blockRepo.updateChain(chain)
  rfdbRepo.updateSelectionItems([])
  editingUid(null)
}

export function selectionClear() {
  rfdbRepo.updateSelectionItems([])
}

//
// Doc Events
//
//
//
//
//
//

// function pageMerge() {}

// export function pageNew(title: string, blockUid: string, shift?: true) {
//   blockRepo.pageNewOp(title, blockUid)
//   pageNewFollowup(title, shift)
//   editingUid(blockUid)
// }

// export function pageNewFollowup(title: string, shift?: true) {
//   const pageUid = blockRepo.getPageUid(title)
//   if (shift) {
//     // rightSidebarOpenItem(pageUid)
//   } else {
//     navigate({ page: { id: pageUid } })
//   }
// }

// function pageRename(oldName: string, newName: string, callback: () => void) {
//   blockRepo.renamePage(oldName, newName)
//   callback()
// }

/**
 * If local-doc found, do nothing
 * If local-doc not found, find remote-note-draft
 * If remote-note-draft not found, create local-doc from note-doc
 * If note-doc not found, create new local-doc
 *
 */
export async function docOpen(title: string) {
  if (docRepo.findDoc(title)) {
    console.debug('found local-doc, return ' + title)
    return
  }

  const [note, draft] = await Promise.all([
      noteService.queryNote(title),
      draftService.queryDraft(title),
    ]),
    op = draft ? ops.docLoadOp(title, draft, note) : ops.docNewOp(title, note)

  blockRepo.update(op.blockReducers)
  docRepo.update(op.docReducers)
}

/**
 * Save doc on remote
 */
export async function docSave(doc: Doc) {}

/**
 * Remove doc from local and remote if possible
 */
export async function docRemove(doc: Doc) {
  if (doc.noteDraftCopy) {
    // update remote
  }
}

export async function editorChangeSymbolMain(symbol: string) {
  const { route } = editorRepo.getValue(),
    doc = getDoc(route.symbolMain)

  if (doc.noteDraftCopy) {
    await docSave(doc)
  } else {
    await docRemove(doc)
  }
  await docOpen(symbol)
  editorRepo.updateRoute({ ...route, symbolMain: symbol })
}

export async function editorChangeSymbolModal(symbol?: string) {
  const { route } = editorRepo.getValue(),
    doc = route.symbolModal ? getDoc(route.symbolModal) : null

  if (doc) {
    if (doc.noteDraftCopy) {
      await docSave(doc)
    } else {
      await docRemove(doc)
    }
  }
  if (symbol) await docOpen(symbol)

  editorRepo.updateRoute({ ...route, symbolModal: symbol })
}

/**
 * Check is main-symbol or modal-symbol has changed by comparing with current value,
 * only one symbol can change at one time
 *
 * - main symbol changed
 * - modal symbol added
 * - modal symbol removed
 * - modal symbol changed
 *
 * For current opened-doc,
 * - If got draft, save doc
 * - If no draft, remove doc
 */
export async function editorRouteChange(
  symbol: string,
  modal?: { symbol: string },
) {
  console.debug('[editorRouteChange] ' + symbol)

  const { route } = editorRepo.getValue()

  const mainSymbolChanged = symbol !== route.symbolMain,
    modalSymbolChanged = modal?.symbol !== route.symbolModal

  if (mainSymbolChanged) {
    editorChangeSymbolMain(symbol)
  } else if (modalSymbolChanged) {
    editorChangeSymbolModal(modal?.symbol)
  }
}
