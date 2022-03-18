import { createStore, withProps, select, setProp, setProps } from '@ngneat/elf'
import {
  addEntities,
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
import {
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'

export type BlockElProps = {
  uid: string
  string: {
    local: string | null
    previous: string | null
    saveFn?: () => void
    idleFn?: () => void
  }
  search: {
    type: null
    results: null
    query: null
    index: null
  }
  dragging: false
  dragTarget: null
  lastKeydown: null
  contextMenu: {
    x: null
    y: null
    show: false
  }
  createPosition: null
  showEditableDom: boolean
}

const blockElsStore = createStore(
  { name: 'blockElsStore' },
  withEntities<BlockElProps, 'uid'>({ idKey: 'uid' }),
)

class BlockElRepository {
  getBlockEl$(uid: string) {
    return blockElsStore.pipe(
      selectEntity(uid),
      // tap(v => console.log(`block   ${v ? v.uid + '-' + v.str : v}`)),
    )
  }
}

export const blockElRepo = new BlockElRepository()
