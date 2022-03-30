import {
  createStore,
  withProps,
  select,
  setProp,
  setProps,
  emitOnce,
  Reducer,
} from '@ngneat/elf'
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
import { genBlockUid } from '../utils'
import { getPage, getPageTitle } from './page.repository'
import { isChildRelation, validatePosition, validateUid } from '../op/helpers'
import { Block } from '../interfaces'

type BlockState = {
  entities: Record<string, Block>
  ids: string[]
}

export type BlockReducer = Reducer<BlockState>

export type BlockReducerFn = () => BlockReducer[]

// Store & Getters

export const blocksStore = createStore(
  { name: 'blocksStore' },
  withEntities<Block, 'uid'>({ idKey: 'uid' }),
)

export function getBlock(uid: string): Block {
  const block = blocksStore.query(getEntity(uid))

  if (block === undefined) {
    console.error(uid)
    throw new Error('[getBlock] Block not found' + uid)
  }
  return block
}

export function getBlockChildren(uid: string): Block[] {
  // return blocksStore.query(getAllEntitiesApply({ filterEntity: e => e.parentUid === uid }))
  const block = getBlock(uid),
    children = block.childrenUids.map((e) => getBlock(e))
  return children
}

class BlockRepository {
  getBlock$(uid: string) {
    return blocksStore.pipe(
      selectEntity(uid),
      // tap((v) => console.log(`block   ${v ? v.uid + '-' + v.str : v}`)),
    )
  }

  getBlockChildren$(uid?: string): Observable<Block[]> {
    // const children$ = blocksStore.pipe(selectManyByPredicate(e => e.parentUid === uid))
    // return this.getBlock$(uid).pipe(
    //   combineLatestWith(children$),
    //   map(([block, children]) => {
    //     return block ? { ...block, children } : undefined
    //   }),
    // )
    if (uid === undefined) {
      return of([])
    }
    return blocksStore.pipe(
      selectManyByPredicate((e) => e.parentUid === uid),
      map((e) => {
        e.sort((a, b) => a.order - b.order)
        return e
      }),
    )
  }

  update(reducers: BlockReducer[]) {
    blocksStore.update(...reducers)
  }

  /**
   * Execute each op one-after-one instead of a single batch
   *
   * TODO: undo/redo
   */
  updateInChain(chainOpFns: BlockReducerFn[]) {
    for (const fn of chainOpFns) {
      blocksStore.update(...fn())
    }
  }
}

export const blockRepo = new BlockRepository()
