import { createStore, withProps, select, setProp, setProps } from '@ngneat/elf'
import {
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

interface RfdbProps {
  db: {
    synced: true
    mtime: null
  }
  currentRoute?: {
    uid: string | null
  }
  loading: true
  modal: false
  alert: null
  win: {
    maximized: false
    fullscreen: false
    focused: true
  }
  athena: {
    open: false
    recentItems: []
  }
  devtool: {
    open: false
  }
  leftSidebar: {
    open: false
  }
  rightSidebar: {
    open: false
    items: {
      //
    }
    width: 32
  }
  mouseDown: boolean
  dailyNotes: {
    items: []
  }
  selection: {
    items: []
  }
  help: {
    open: false
  }
  zoomLevel: 0
  fs: {
    watcher: null
  }
  presence: {
    //
  }
  connectionStatus: 'disconnected'
  //
  selectSubs?: {
    items?: []
  }
  editing?: {
    uid: string | null
  }
}

export const rfdbStore = createStore(
  { name: 'rfdbStore' },
  // withEntities<BlockProps, 'uid'>({ idKey: 'uid' }),
  withProps<RfdbProps>({
    menu: {
      show: false,
    },
    title: {
      // initial: undefined,
      // local: undefined,
    },
    alert: {
      // show: undefined,
      // message: undefined,
      // confirmFn: undefined,
      // cancelFn: undefined,
    },
  }),
)

// export const rfdb$ = rfdbStore.pipe(select(state => state))

// export const updateRFDBProps = (state: Partial<RFDBProps>) => {
//   rfdbStore.update(setProps(state))
// }

class RfdbRepository {
  editingUid$ = rfdbStore.pipe(select(state => state.editing?.uid))

  setProps(props: Partial<RfdbProps>) {
    rfdbStore.update(setProps(props))
  }

  getIsEditing(uid: string): boolean {
    const value = rfdbStore.getValue()
    return value.editing?.uid === uid
  }

  getValue() {
    return rfdbStore.getValue()
  }

  getBlockIsEditing$(uid: string) {
    return this.editingUid$.pipe(
      map(x => x === uid),
      distinctUntilChanged(),
    )
  }

  updateEditingUid(uid: string | null, charIndex?: 'end' | number) {
    rfdbStore.update(setProp('editing', { uid }))
  }
}

export const rfdbRepo = new RfdbRepository()
