import { KeyboardEvent } from 'react'
import { DestructTextareaKeyEvent } from './textarea-keydown'
import { editingFocus, navigate, setCursorPosition } from './effects'
import { compatPosition, getNextBlock, getNthSiblingBlock, getPrevBlock } from './stores/block/helpers'
import { blockRepo, blocksStore, getBlock, getBlockChildren, getBlockParent } from './stores/block/block.repository'
import { rfdbRepo } from './stores/rfdb.repository'
import { genBlockUid } from './utils'
import { Block, PositionRelation } from './stores/block/types'

function blockSaveBlockMoveCompositeOp(sourceUid: string, refUid: string, relation: PositionRelation, str: string) {
  const location = compatPosition({ blockUid: refUid, relation })

  // TODO: composite ops
  blockRepo.blockSaveOp(sourceUid, str)
  blockRepo.blockMoveOp(sourceUid, location)
}

function getPrevSiblingBlockAndTargetRel(block: Block): [Block | null, PositionRelation] {
  const parent = block.parentUid ? getBlock(block.parentUid) : null,
    prevSib = parent && getNthSiblingBlock(block, parent, -1),
    targetRel = prevSib && prevSib.childrenUids.length > 0 ? 'last' : 'first'
  return [prevSib, targetRel]
}

export const events = {
  up(uid: string, targetPos: number | 'end') {
    const block = getBlock(uid),
      parent = block.parentUid && getBlock(block.parentUid),
      prev = parent && getPrevBlock(block, parent),
      editingUid = prev ? prev.uid : uid
    console.debug(block, parent, prev, blocksStore.getValue())
    this.editingUid(editingUid, targetPos)
  },

  down(uid: string, targetPos: number | 'end') {
    const block = getBlock(uid),
      next = block && getNextBlock(block),
      editingUid = next ? next.uid : uid
    this.editingUid(editingUid, targetPos)
  },

  /**
   * "If root and 0th child, 1) if value, no-op, 2) if blank value, delete only block.
  No-op if parent is missing.
  No-op if parent is prev-block and block has children.
  No-op if prev-sibling-block has children.
  Otherwise delete block and join with previous block
  If prev-block has children"
   * 
   */
  backspace(uid: string, value: string, maybeLocalUpdates?: string) {
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
      this.backspaceDeleteOnlyChild(uid)
      return
    }
    if (prev && maybeLocalUpdates) {
      this.backspaceDeleteMergeBlockWithSave(uid, value, prev, maybeLocalUpdates)
      return
    }
    if (prev) {
      this.backspaceDeleteMergeBlock(uid, value, prev)
    }
    console.error({ block, value, maybeLocalUpdates, children, parent, prev, prevSib })
    throw 'backspace::unhandled situation'
  },

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
  enter(uid: string, dKeyDown: DestructTextareaKeyEvent) {
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
      this.enterAddChild(block, newUid)
    } else if (!block.open && hasChildren && caretAtEnd && parent) {
      this.enterNewBlock(block, parent, newUid)
    } else if ((valueEmpty || rootBlock) && parent) {
      this.enterNewBlock(block, parent, newUid)
    } else if (block.open && !caretAtEnd) {
      this.enterSplitBlock(block, newUid, value, start, 'first')
    } else if (start !== 0) {
      this.enterSplitBlock(block, newUid, value, start, 'after')
    } else if (valueEmpty) {
      this.unindent(uid, dKeyDown, '', contextRootUid)
    } else if (start === 0 && value) {
      this.enterBumpUp(uid, newUid)
    } else {
      console.debug('[enter] ->', { uid, dKeyDown, block, parent })
      throw '[enter]'
    }
  },

  /**
   * ;; - `block-zero`: The first block in a page
    ;; - `value`     : The current string inside the block being indented. Otherwise, if user changes block string and indents,
    ;;                 the local string  is reset to original value, since it has not been unfocused yet (which is currently the
    ;;                 transaction that updates the string).
    // if sibling block is closed with children, open
   */
  indent(uid: string, dKeyDown: DestructTextareaKeyEvent, localStr: string) {
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
  },

  unindent(uid: string, dKeyDown: DestructTextareaKeyEvent, localStr: string, contextRootUid?: string) {
    const parent = getBlockParent(uid),
      doNothing = parent.pageTitle !== null || contextRootUid === parent.uid,
      { start, end } = dKeyDown

    // async flow
    blockSaveBlockMoveCompositeOp(uid, parent.uid, 'after', localStr)
    this.editingUid(uid)
    setCursorPosition(uid, start, end)
  },

  // Backspace Events

  backspaceDeleteMergeBlock(uid: string, value: string, prevBlock: Block) {
    // async flow
    blockRepo.blockRemoveMergeOp(uid, prevBlock.uid, value)
    // focusOnUid(prevBlock.uid, prevBlock.str.length)
    events.editingUid(uid, prevBlock.str.length)
  },

  backspaceDeleteMergeBlockWithSave(uid: string, value: string, prevBlock: Block, localUpdate?: string) {
    // async flow
    blockRepo.blockMergeWithUpdateOp(uid, prevBlock.uid, value, localUpdate)
    // focusOnUid(prevBlock.uid, localUpdate?.length)
    events.editingUid(uid, localUpdate?.length)
  },

  backspaceDeleteOnlyChild(uid: string) {
    blockRepo.blockRemoveOp(uid)
    this.editingUid(null)
  },

  // Block events

  blockOpen(uid: string, open: boolean) {
    blockRepo.blockOpenOp(uid, open)
  },

  blockSave(uid: string, str: string) {
    const block = getBlock(uid),
      doNothing = block.str === str

    if (block.pageTitle) {
      throw 'blockSave::node-block not allow to change string'
    }
    if (!doNothing) {
      blockRepo.blockSaveOp(uid, str)
    }
  },

  // Editing Events

  editingTarget(target: HTMLTextAreaElement) {
    const uid = target.id.split('editable-uid-')[1]
    this.editingUid(uid)
  },

  editingUid(uid: string | null, cursorAnchor?: number | 'end') {
    rfdbRepo.updateEditingUid(uid)
    console.log('editingUid', uid)

    editingFocus(uid, cursorAnchor)
  },

  // Enter Events

  enterAddChild(block: Block, newUid: string) {
    const position = compatPosition({ blockUid: block.uid, relation: 'first' })
    blockRepo.blockNewOp(newUid, position)
    events.editingUid(newUid)
  },

  enterSplitBlock(block: Block, newUid: string, value: string, index: number, relation: PositionRelation) {
    blockRepo.blockSplitOp(block, newUid, value, index, relation)
    events.editingUid(newUid)
  },

  enterBumpUp(uid: string, newUid: string) {
    const position = compatPosition({ blockUid: uid, relation: 'before' })
    blockRepo.blockNewOp(newUid, position)
    events.editingUid(newUid)
  },

  enterNewBlock(block: Block, parent: Block, newUid: string) {
    blockRepo.update(blockRepo.blockNewOp(newUid, { blockUid: block.uid, relation: 'after' }))
    events.editingUid(newUid)
  },

  /**
   * ;; Triggered when there is a closed embeded block with no content in the top level block
    ;; and then one presses enter in the embeded block.
   */
  // enterOpenBlockAddChild() {},

  // Page Events

  // pageMerge() {},

  pageNew(title: string, blockUid: string, shift?: true) {
    blockRepo.pageNewOp(title, blockUid)
    this.pageNewFollowup(title, shift)
    this.editingUid(blockUid)
  },

  pageNewFollowup(title: string, shift?: true) {
    const pageUid = blockRepo.getPageUid(title)
    if (shift) {
      // this.rightSidebarOpenItem(pageUid)
    } else {
      navigate({ page: { id: pageUid } })
    }
  },

  // pageRename(oldName: string, newName: string, callback: () => void) {
  //   blockRepo.renamePage(oldName, newName)
  //   callback()
  // },
}
