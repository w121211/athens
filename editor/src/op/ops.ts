/**
 * Ops is by designed called by event to make one or many mutations of the block-store,
 * each op function produce `BlockRecuer[]` for later execute in a batch.
 *
 */

import {
  addEntities,
  deleteEntities,
  updateEntities,
} from '@ngneat/elf-entities'
import assert from 'assert'
import { Block, Position, PositionRelation } from '../interfaces'
import {
  BlockReducer,
  BlockReducerFn,
  getBlock,
  getBlockChildren,
} from '../stores/block.repository'
import { getPage, getPageTitle } from '../stores/page.repository'
import {
  isChildRelation,
  isDescendant,
  validatePosition,
  validateUid,
} from './helpers'
import { insert, moveBetween, moveWithin, remove, reorder } from './order'
import { allDescendants } from './queries'

// Helpers

function reorderOps(reorderBlocks: Block[]): BlockReducer[] {
  return reorderBlocks.map((e) => updateEntities(e.uid, { order: e.order }))
}

// function consequenceOps() {}

// ------ Block Atomic Ops ------

/**
 * Move a block, fails if it has children
 * - is block x move in the same parent?
 *   - (yes) move between & change order
 *   - (no)
 *     - get new parent from position
 *     - remove x from old parent-children
 *     - reoder old parent-children
 *
 */
export function blockMoveOp(
  block: Block,
  position: Position,
  opts: { validate: boolean } = { validate: true },
): BlockReducer[] {
  // in case of consequence-ops, validation will fail since the required block is not yet existed
  if (opts.validate) {
    validatePosition(position)
  }

  if (getPageTitle(block.uid) !== null || block.parentUid === null) {
    console.error(block)
    throw new Error(
      '[blockMoveOp] block to be moved is a page, cannot move pages.',
    )
  }

  const { blockUid: _refUid, pageTitle: refTitle, relation } = position,
    refPage = refTitle ? getPage(refTitle) : null,
    refUid = _refUid ?? refPage?.blockUid ?? null,
    refBlock = refUid ? getBlock(refUid) : null,
    refChildRelation = isChildRelation(relation),
    refBlockParent =
      refBlock && refBlock.parentUid ? getBlock(refBlock.parentUid) : null,
    newParentBlock = refChildRelation ? refBlock : refBlockParent

  // console.debug(
  //   refPage,
  //   refUid,
  //   refBlock,
  //   refChildRelation,
  //   refBlockParent,
  //   newParentBlock,
  // )

  assert(refBlock, '[blockMoveOp] refBlock does not exist')
  assert(newParentBlock, '[blockMoveOp] newParentBlock === null')
  assert(
    !isDescendant(refBlock, block),
    '[blockMoveOp] refBlock is descendant of block',
  )

  const oldParent = getBlock(block.parentUid),
    sameParent = newParentBlock.uid === oldParent.uid,
    editTime = Date.now()

  // console.debug(oldParent, sameParent)

  let ops: BlockReducer[] = [
    updateEntities(block.uid, { editTime, parentUid: newParentBlock.uid }),
  ]

  let reorder_: Block[]
  if (sameParent) {
    const children = getBlockChildren(oldParent.uid),
      children_ = moveWithin(children, block, relation, refBlock)
    reorder_ = reorder(children, children_)

    // console.debug(children_, reorder_)

    ops.push(
      updateEntities(oldParent.uid, {
        childrenUids: children_.map((e) => e.uid),
        editTime,
      }),
    )
  } else {
    const originChildren = getBlockChildren(oldParent.uid),
      destChildren = getBlockChildren(newParentBlock.uid),
      [originChildren_, destChildren_] = moveBetween(
        originChildren,
        destChildren,
        block,
        relation,
        refBlock,
      ),
      reorderOrigin = reorder(originChildren, originChildren_),
      reorderDest = reorder(destChildren, destChildren_)
    reorder_ = reorderOrigin.concat(reorderDest)

    ops = ops.concat([
      updateEntities(oldParent.uid, {
        childrenUids: originChildren_.map((e) => e.uid),
        editTime,
      }),
      updateEntities(newParentBlock.uid, {
        childrenUids: destChildren_.map((e) => e.uid),
        editTime,
      }),
    ])
  }
  return ops.concat(reorderOps(reorder_))
}

/**
 * - add new block
 * - update parent.childrenUids
 * - update parent->children order
 *
 */
export function blockNewOp(newUid: string, position: Position): BlockReducer[] {
  validatePosition(position)
  validateUid(newUid)

  const { blockUid: _refUid, pageTitle: refTitle, relation } = position,
    refPage = refTitle ? getPage(refTitle) : null,
    refUid = _refUid ?? refPage?.blockUid ?? null,
    refBlock = refUid ? getBlock(refUid) : null,
    refChildRelation = isChildRelation(relation),
    refBlockParent =
      refBlock && refBlock.parentUid ? getBlock(refBlock.parentUid) : null,
    newParentBlock = refChildRelation ? refBlock : refBlockParent

  if (refBlock === null) throw new Error('refBlock === null')
  if (newParentBlock === null) throw new Error('newParentBlock === null')

  const editTime = Date.now(),
    newBlock: Block = {
      uid: newUid,
      str: '',
      open: true,
      childrenUids: [],
      editTime,
      order: 0, // temporary
      parentUid: newParentBlock.uid,
    },
    children = getBlockChildren(newParentBlock.uid),
    children_ = insert(children, newBlock, relation, refBlock),
    reorder_ = reorder(children, children_)

  let ops: BlockReducer[] = [
    addEntities([newBlock]),
    updateEntities(newParentBlock.uid, {
      childrenUids: children_.map((e) => e.uid),
      editTime,
    }),
  ]
  ops = ops.concat(reorderOps(reorder_))

  // console.debug(newParentBlock, children, children_)

  return ops
}

export function blockOpenOp(uid: string, open: boolean): BlockReducer[] {
  const block = getBlock(uid)
  if (block.open === open) {
    console.info(
      'block/open already at desired state, :block/open',
      block.open,
      open,
    )
    return []
  }
  return [updateEntities(block.uid, { open })]
}

/**
 * - update parent's childrenUids
 * - update siblings order
 * - remove block and all its descendants (kids)
 *
 */
export function blockRemoveOp(removeBlock: Block): BlockReducer[] {
  const kids = allDescendants(removeBlock),
    kidsUids = kids.map((e) => e.uid),
    parent = removeBlock.parentUid ? getBlock(removeBlock.parentUid) : null

  let ops: BlockReducer[] = []
  if (parent) {
    const parentChildren = getBlockChildren(parent.uid),
      parentChildren_ = remove(parentChildren, removeBlock),
      reorder_ = reorder(parentChildren, parentChildren_)
    ops = ops.concat([
      updateEntities(parent.uid, {
        childrenUids: parentChildren_.map((e) => e.uid),
      }),
      ...reorderOps(reorder_),
    ])
  }
  ops.push(deleteEntities([removeBlock.uid, ...kidsUids]))

  return ops
}

export function blockSaveOp(uid: string, str: string): BlockReducer[] {
  // if (block.str === str) {
  //   return []
  // }
  return [updateEntities(uid, { str, editTime: Date.now() })]
}

// ------ Chain Ops ------

/**
 * "Creates `:block/remove` & `:block/save` ops.
  Arguments:
  - `db` db value
  - `remove-uid` `:block/uid` to delete
  - `merge-uid` `:block/uid` to merge (postfix) `value` to
  - `value`: string to be postfixed to `:block/string` of `merge-uid`"
 * 
 * @eg
 * - hello // merge
 * - world // remove, value = 'world'
 *   - ccc
 *   - ddd
 * 
 * >>>>>>
 * 
 * - helloworld
 *   - ccc
 *   - ddd
 */
export function blockMergeChainOp(
  removeBlock: Block,
  mergeBlock: Block,
  value: string,
): BlockReducerFn[] {
  // const childrenToMove = getBlockChildren(removeBlock.uid),
  //   moveOps = childrenToMove
  //     .map((e) =>
  //       blockMoveOp(e, {
  //         blockUid: mergeBlock.uid,
  //         relation: 'last',
  //       }),
  //     )
  //     .reduce((acc, cur) => acc.concat(cur), []),
  //   removeOp = blockRemoveOp(removeBlock),
  //   saveOp = blockSaveOp(mergeBlock.uid, mergeBlock.str + value)
  // return [...moveOps, ...removeOp, ...saveOp]

  const fns: BlockReducerFn[] = removeBlock.childrenUids.map((e) => {
    const block = getBlock(e)
    return () =>
      blockMoveOp(block, { blockUid: mergeBlock.uid, relation: 'last' })
  })
  fns.push(() => blockRemoveOp(removeBlock))
  fns.push(() => blockSaveOp(mergeBlock.uid, mergeBlock.str + value))

  return fns
}

/**
 * For backspace event
 *
 * steps:
 * - move remove-block's children
 * - remove remove-block
 * - save merge-block
 *
 * @eg
 * - hello // merge,  updateValue = 'hello'
 * - world // remove, value       = 'world'
 *   - ccc
 *   - ddd
 *
 * >>>>>
 *
 * - helloworld
 *   - ccc
 *   - ddd
 *
 * TODO: remove-block and merge-block need to be siblings?
 */
export function blockMergeWithUpdatedChainOp(
  removeBlock: Block,
  mergeBlock: Block,
  value: string,
  updateValue = '',
): BlockReducerFn[] {
  // const removeOp = blockRemoveOp(removeBlock),
  //   saveOp = blockSaveOp(mergeBlock.uid, updateValue + value),
  //   childrenToMove = removeBlock.childrenUids,
  //   moveOps = childrenToMove.map((e) => {
  //     const block = getBlock(e)
  //     return blockMoveOp(block, { blockUid: mergeBlock.uid, relation: 'last' })
  //   }),
  //   deleteAndMergeOp = moveOps.concat([removeOp, saveOp])

  const fns: BlockReducerFn[] = removeBlock.childrenUids.map((e) => {
    const block = getBlock(e)
    return () =>
      blockMoveOp(block, { blockUid: mergeBlock.uid, relation: 'last' })
  })
  fns.push(() => blockRemoveOp(removeBlock))
  fns.push(() => blockSaveOp(mergeBlock.uid, updateValue + value))

  return fns
}

/**
 * Move source block and its siblings to the target
 *
 * @eg source = [a, b, c, d], target = z
 * - move a to z
 * - move b after a, move c after b, ...
 *
 * @returns consequence-op
 *
 * TODO: what if source-uids are not siblings?
 */
export function blockMoveChainOp(
  targetUid: string,
  sourceUids: string[],
  firstRel: PositionRelation,
): BlockReducerFn[] {
  // TODO: validate source-uids are siblings

  // const first = getBlock(sourceUids[0]),
  //   ops: BlockReducer[][] = [
  //     blockMoveOp(first, { blockUid: targetUid, relation: firstRel }),
  //   ]
  // for (let i = 0; i < sourceUids.length - 1; i++) {
  //   const one = sourceUids[i],
  //     two = sourceUids[i + 1],
  //     two_ = getBlock(two)
  //   ops.push(blockMoveOp(two_, { blockUid: one, relation: 'after' }))
  // }
  // return ops

  const first = getBlock(sourceUids[0]),
    fns: BlockReducerFn[] = [
      () => blockMoveOp(first, { blockUid: targetUid, relation: firstRel }),
    ]

  for (let i = 0; i < sourceUids.length - 1; i++) {
    const one = sourceUids[i],
      two = sourceUids[i + 1],
      two_ = getBlock(two)
    fns.push(() => blockMoveOp(two_, { blockUid: one, relation: 'after' }))
  }
  return fns
}

/**
 * * "Creates `:block/split` composite op, taking into account context.
  If old-block has children, pass them on to new-block.
  If old-block is open or closed, pass that state on to new-block."
 * 
 * @param str current local string to split
 * @param idx index for string to split at
 * @returns consequence-op
 */
export function blockSplitChainOp(
  oldBlock: Block,
  newBlockUid: string,
  str: string,
  idx: number,
  relation: PositionRelation,
): BlockReducerFn[] {
  // const saveOp = () => blockSaveOp(oldBlock.uid, str.substring(0, idx)),
  //   newOp = () => blockNewOp(newBlockUid, { blockUid: oldBlock.uid, relation }),
  //   saveNewOp = () => blockSaveOp(newBlockUid, str.substring(idx)),
  //   { open } = oldBlock,
  //   children = getBlockChildren(oldBlock.uid),
  //   hasChildren = children.length > 0,
  //   moveChildrenOp = hasChildren
  //     ? blockMoveChain(
  //         newBlockUid,
  //         children.map((e) => e.uid),
  //         'first',
  //       )
  //     : [],
  //   closeNewOp = hasChildren
  //     ? blockOpenOp(newBlockUid, oldBlock.open ?? false)
  //     : []
  // splitOp = [saveOp, newOp, saveNewOp, ...moveChildrenOp, closeNewOp]
  // return splitOp

  const chains: BlockReducerFn[] = [
    // save old-block
    () => blockSaveOp(oldBlock.uid, str.substring(0, idx)),

    // create new block
    () => blockNewOp(newBlockUid, { blockUid: oldBlock.uid, relation }),

    // save new-block
    () => blockSaveOp(newBlockUid, str.substring(idx)),

    // move children (if any)
  ]

  return chains
}

// ------ Page Ops ------

// export function pageNewOp(): [PageReducer[], BlockReducer[]] {
//   // const newBlockOp = blockNewOp()
// }

// export function pageRenameOp() {}

// export function pageMergeOp() {}

// export function pageRemoveOp() {}

// // ------ Shortcut Ops ------

// export function shortcutNewOp() {}

// export function shortcutRemoveOp() {}

// export function shortcutMoveOp() {}
