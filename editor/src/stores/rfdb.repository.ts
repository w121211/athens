import { createStore, withProps, select, setProp, setProps } from '@ngneat/elf'
import { distinctUntilChanged, map, tap } from 'rxjs'

interface RfdbProps {
  db: {
    synced: true
    mtime: null
  }
  currentRoute?: {
    uid: string | null // current root uid
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
    items: string[] // uids
    // selected: (uid) => boolean
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
  // selectSubs?: {
  //   items?: string[]
  // }
  editing: {
    uid: string | null
  }
}

export const rfdbStore = createStore(
  { name: 'rfdbStore' },
  // withEntities<BlockProps, 'uid'>({ idKey: 'uid' }),
  withProps<RfdbProps>({
    db: {
      synced: true,
      mtime: null,
    },
    currentRoute: {
      uid: null,
    },
    loading: true,
    modal: false,
    alert: null,
    win: {
      maximized: false,
      fullscreen: false,
      focused: true,
    },
    athena: {
      open: false,
      recentItems: [],
    },
    devtool: {
      open: false,
    },
    leftSidebar: {
      open: false,
    },
    rightSidebar: {
      open: false,
      items: {
        //
      },
      width: 32,
    },
    mouseDown: false,
    dailyNotes: {
      items: [],
    },
    selection: {
      items: [], // uids,
      // selected: (uid) => boolean
    },
    help: {
      open: false,
    },
    zoomLevel: 0,
    fs: {
      watcher: null,
    },
    presence: {
      //
    },
    connectionStatus: 'disconnected',
    //
    // selectSubs?: {
    //   items?: string[]
    // }
    editing: {
      uid: null,
    },
  }),
)

class RfdbRepository {
  editingUid$ = rfdbStore.pipe(select((state) => state.editing?.uid))

  selectionItems$ = rfdbStore.pipe(select((state) => state.selection.items))

  setProps(props: Partial<RfdbProps>) {
    rfdbStore.update(setProps(props))
  }

  getIsEditing(uid: string): boolean {
    const value = this.getValue()
    return value.editing?.uid === uid
  }

  getIsSelected(uid: string): boolean {
    const value = this.getValue()
    return value.selection?.items?.includes(uid)
  }

  getValue() {
    return rfdbStore.getValue()
  }

  // Stream getters

  getIsEditing$(uid: string) {
    return this.editingUid$.pipe(
      map((e) => e === uid),
      distinctUntilChanged(),
    )
  }

  getIsSelected$(uid: string) {
    return this.selectionItems$.pipe(
      map((items) => items.includes(uid)),
      distinctUntilChanged(),
    )
  }

  updateEditingUid(uid: string | null, charIndex?: 'end' | number) {
    rfdbStore.update(setProp('editing', { uid }))
  }

  updateMouseDown(mouseDown: boolean) {
    rfdbStore.update(setProp('mouseDown', mouseDown))
  }

  updateSelectionItems(items: string[]) {
    rfdbStore.update(setProp('selection', { items }))
  }
}

export const rfdbRepo = new RfdbRepository()
