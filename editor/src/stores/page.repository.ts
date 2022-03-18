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
import { genBlockUid } from '../utils'
import { getBlock } from './block/block.repository'

export type Page = {
  title: string // as id
  blockUid: string // corresponding block
}

const pagesStore = createStore(
  { name: 'pagesStore' },
  withEntities<Page, 'title'>({ idKey: 'title' }),
)

export function getPage(title: string): Page {
  const page = pagesStore.query(getEntity(title))
  if (page === undefined) {
    throw 'getBlock::block === undefined' + title
  }
  return page
}

export function getPageTitle(blockUid: string): string | undefined {
  const block = getBlock(blockUid)
  return block.pageTitle
}

class PageRepository {
  // getBlock$(uid: string) {
  //   return blocksStore.pipe(
  //     selectEntity(uid),
  //     tap(v => console.log(`block   ${v ? v.uid + '-' + v.str : v}`)),
  //   )
  // }
  // getChildren$(uid: string) {
  //   return blocksStore.pipe(selectManyByPredicate(e => e.parentUid === uid))
  // }
  // getBlockWithChildren$(
  //   uid: string,
  // ): Observable<
  //   | (Block & {
  //       children: Block[]
  //     })
  //   | undefined
  // > {
  //   const children$ = blocksStore.pipe(selectManyByPredicate(e => e.parentUid === uid))
  //   return this.getBlock$(uid).pipe(
  //     combineLatestWith(children$),
  //     map(([block, children]) => {
  //       return block ? { ...block, children } : undefined
  //     }),
  //   )
  // }

  pageNewOp(title: string, blockUid: string): BlockReducer[] {
    const pageExists = eByAv('node/title', title)

    if (pageExists) {
      const pageUid = genBlockUid(),
        page: Block = {
          ndoeTitle: title,
          uid: pageUid,
          childrenUids: [],
        }
      return [addEntities(page)]
    }
    return []
  }

  pageRemoveOp(title: string): BlockReducer[] {
    const pageUid = getPageUid(title)

    if (pageUid) {
      const retractBlocks = retractUidRecursively(pageUid)
      // deleteLinkedRefs = null,
      return [retractBlocks]
    }
    return []
  }

  // pageMergeOp() {}

  // pageRenameOp() {}
}

export const pageRepo = new PageRepository()
