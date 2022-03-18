import { createStore, withProps, select, setProp, setProps, emitOnce, Reducer } from '@ngneat/elf'
import {
  addEntities,
  deleteEntities,
  EntitiesState,
  getAllEntities,
  getAllEntitiesApply,
  getEntity,
  selectAllEntities,
  selectEntities,
  selectEntity,
  selectManyByPredicate,
  setEntities,
  updateEntities,
  upsertEntities,
  withEntities,
} from '@ngneat/elf-entities'
import { title } from 'process'
import {
  combineLatest,
  combineLatestWith,
  concat,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'
import { genBlockUid } from '../../utils'
import { getPage, getPageTitle } from '../page.repository'
import { isChildRelation, validatePosition } from './helpers'
import { insert, moveBetween, moveWithin, reorder } from './order'
import { Block, Position, PositionRelation } from './types'

type BlockState = {
  entities: Record<string, Block>
  ids: string[]
}

type BlockReducer = Reducer<BlockState>

// Store & Getters

export const blocksStore = createStore(
  { name: 'blocksStore' },
  withEntities<Block, 'uid'>({ idKey: 'uid' }),
)

export function getBlock(uid: string): Block {
  const block = blocksStore.query(getEntity(uid))

  if (block === undefined) {
    throw 'getBlock::block === undefined' + uid
  }
  return block
}

export function getBlockChildren(uid: string): Block[] {
  // return blocksStore.query(getAllEntitiesApply({ filterEntity: e => e.parentUid === uid }))
  const block = getBlock(uid),
    children = block.childrenUids.map(e => getBlock(e))
  return children
}

export function getBlockParent(uid: string): Block {
  const block = blocksStore.query(getEntity(uid))

  if (block === undefined) {
    throw 'getBlock::block === undefined' + uid
  }
  return block
}

// Ops Helpers

function reorderOps(reorderBlocks: Block[]): BlockReducer[] {
  return reorderBlocks.map(e => updateEntities(e.uid, { order: e.order }))
}

class BlockOp {
  // --- Atomic Ops ---

  /**
   * - is block x move in the same parent?
   *   - (yes) move between & change order
   *   - (no)
   *     - get new parent from position
   *     - remove x from old parent-children
   *     - reoder old parent-children
   *     -
   */
  blockMoveOp(block: Block, position: Position): BlockReducer[] {
    validatePosition(position)
    if (getPageTitle(block.uid) !== null || block.parentUid === null)
      throw 'Block to be moved is a page, cannot move pages.'

    const { blockUid: _refUid, pageTitle: refTitle, relation } = position,
      refPage = refTitle ? getPage(refTitle) : null,
      refUid = _refUid ?? refPage?.blockUid ?? null,
      refBlock = refUid ? getBlock(refUid) : null,
      refChildRelation = isChildRelation(relation),
      refBlockParent = refBlock && refBlock.parentUid ? getBlock(refBlock.parentUid) : null,
      newParentBlock = refChildRelation ? refBlock : refBlockParent

    if (refBlock === null) throw 'Ref block does not exist'
    if (newParentBlock === null) throw 'newParentBlock === null'

    const oldParent = getBlock(block.parentUid),
      sameParent = newParentBlock.uid === oldParent.uid,
      editTime = Date.now()

    let ops: BlockReducer[] = [
      updateEntities(block.uid, { editTime }),
      // updateEntities(oldParent.uid, { childrenUids: oldParent.childrenUids.filter(f => f !== block.uid), editTime }),
    ]

    let reordered: Block[]
    if (sameParent) {
      const children = getBlockChildren(oldParent.uid),
        children_ = moveWithin(children, block, relation, refBlock)
      reordered = reorder(children, children_)

      ops.push(
        updateEntities(oldParent.uid, {
          childrenUids: children_.map(e => e.uid),
          editTime,
        }),
      )
    } else {
      const originChildren = getBlockChildren(oldParent.uid),
        destChildren = getBlockChildren(newParentBlock.uid),
        [originChildren_, destChildren_] = moveBetween(originChildren, destChildren, block, relation, refBlock),
        reorderOrigin = order.reorder(originChildren, originChildren_),
        reorderDest = order.reorder(destChildren, destChildren_)
      reordered = reorderOrigin.concat(reorderDest)

      ops = ops.concat([
        updateEntities(oldParent.uid, {
          childrenUids: originChildren_.map(e => e.uid),
          editTime,
        }),
        updateEntities(newParentBlock.uid, {
          childrenUids: destChildren_.map(e => e.uid),
          editTime,
        }),
      ])
    }
    return ops.concat(reorderOps(reorder))
  }

  /**
   * - add new block
   * - update parent.childrenUids
   * - update parent->children order
   */
  blockNewOp(newUid: string, position: Position): BlockReducer[] {
    validatePosition(position)

    const { blockUid: _refUid, pageTitle: refTitle, relation } = position,
      refPage = refTitle ? getPage(refTitle) : null,
      refUid = _refUid ?? refPage?.blockUid ?? null,
      refBlock = refUid ? getBlock(refUid) : null,
      refChildRelation = isChildRelation(relation),
      refBlockParent = refBlock && refBlock.parentUid ? getBlock(refBlock.parentUid) : null,
      newParentBlock = refChildRelation ? refBlock : refBlockParent

    if (refBlock === null) throw 'refBlock === null'
    if (newParentBlock === null) throw 'newParentBlock === null'

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
      updateEntities(newParentBlock.uid, { childrenUids: children_.map(e => e.uid), editTime }),
    ]
    ops = ops.concat(reorderOps(reorder_))

    // console.debug(newParentBlock, children, children_)

    return ops
  }

  blockOpenOp(uid: string, open: boolean): BlockReducer[] {
    // if (block.open === open) {
    //   console.info('block/open already at desired state, :block/open', block.open)
    // }
    return [updateEntities(uid, { open })]
  }

  /**
   * - update parent.childrenUids
   * - update siblings order
   * - remove block and all its descendants (kids)
   *
   */
  blockRemoveOp(removeBlock: Block): BlockReducer[] {
    const kids = getAllDescendants(removeBlock),
      kidsUids = kids.map(e => e.uid),
      parent = removeBlock.parentUid ? getBlock(removeBlock.parentUid) : null

    let ops: BlockReducer[] = []
    if (parent) {
      const parentChildren = parent && getBlockChildren(parent.uid),
        parentChildren_ = parentChildren && order.remove(parentChildren, removeBlock),
        reorder = parentChildren && parentChildren_ && order.reorder(parentChildren, parentChildren_)
      ops = ops.concat([
        updateEntities(parent.uid, { childrenUids: parentChildren_.map(e => e.uid) }),
        ...reorderOps(reorder),
      ])
    }
    ops.push(deleteEntities([removeBlock.uid, ...kidsUids]))
    return ops
  }

  blockSaveOp(uid: string, str: string): BlockReducer[] {
    // if (block.str === str) {
    //   return []
    // }
    return [updateEntities(uid, { str, editTime: Date.now() })]
  }

  // --- Composite Ops ---

  blockMoveChain() {
    //
  }

  /**
   * "Creates `:block/remove` & `:block/save` ops.
  Arguments:
  - `db` db value
  - `remove-uid` `:block/uid` to delete
  - `merge-uid` `:block/uid` to merge (postfix) `value` to
  - `value`: string to be postfixed to `:block/string` of `merge-uid`"
   */
  blockRemoveMergeOp(removeBlock: Block, mergeBlock: Block, value: string): BlockReducer[] {
    const childrenToMove = getBlockChildren(removeBlock.uid),
      blockMoveOps = childrenToMove
        .map(e => this.blockMoveOp(e, { blockUid: mergeBlock.uid, relation: 'last' }))
        .reduce((acc, cur) => acc.concat(cur), []),
      blockRemoveOp = this.blockRemoveOp(removeBlock),
      blockSaveOp = this.blockSaveOp(mergeBlock.uid, mergeBlock.str + value)

    // composite/make-consequence-op
    return [...blockMoveOps, ...blockRemoveOp, ...blockSaveOp]
  }

  // blockMergeWithUpdateOp(uid: string, prevBlockUid: string, value: string, localUpdate?: string) {}

  /**
   * "Creates `:block/split` composite op, taking into account context.
  If old-block has children, pass them on to new-block.
  If old-block is open or closed, pass that state on to new-block."
   */
  blockSplitOp(oldBlock: Block, newBlockUid: string, str: string, index: number, relation: PositionRelation) {
    const blockSaveOp = this.blockSaveOp(oldBlock.uid, str.substring(0, index)),
      blockNewOp = this.blockNewOp(newBlockUid, { blockUid: oldBlock.uid, relation }),
      blockNewSaveOp = this.blockSaveOp(newBlockUid, str.substring(index)),
      children = getBlockChildren(oldBlock.uid),
      // childrenMoveOp = blockMoveChain(newBlockUid, children, ':first'),
      blockNewCloseOp = children.length > 0 ? this.blockOpenOp(newBlockUid, oldBlock.open ?? false) : []

    // composite/make-consequence-op
    const ops: BlockReducer[] = [
      ...blockSaveOp,
      ...blockNewOp,
      ...blockNewSaveOp,
      // ...childrenMoveOp,
      // ...blockNewCloseOp,
    ]
    return ops
  }
}

class BlockRepository extends BlockOp {
  getBlock$(uid: string) {
    return blocksStore.pipe(
      selectEntity(uid),
      tap(v => console.log(`block   ${v ? v.uid + '-' + v.str : v}`)),
    )
  }

  getBlockChildren$(uid: string): Observable<Block[]> {
    // const children$ = blocksStore.pipe(selectManyByPredicate(e => e.parentUid === uid))
    // return this.getBlock$(uid).pipe(
    //   combineLatestWith(children$),
    //   map(([block, children]) => {
    //     return block ? { ...block, children } : undefined
    //   }),
    // )
    return blocksStore.pipe(
      selectManyByPredicate(e => e.parentUid === uid),
      map(e => {
        e.sort((a, b) => a.order - b.order)
        return e
      }),
    )
  }

  update(reducers: BlockReducer[]) {
    blocksStore.update(...reducers)
  }
}

export const blockRepo = new BlockRepository()
