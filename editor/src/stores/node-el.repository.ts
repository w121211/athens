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
import { blocksStore } from './block.repository'

const nodeElStore = createStore(
  { name: 'nodeStateStore' },
  // withEntities<BlockProps, 'uid'>({ idKey: 'uid' }),
  withProps<NodeElProps>({
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

export const nodeEl$ = nodeElStore.pipe(select(state => state))

function setNode(node: NodeProps) {
  // return nodeElStore.pipe(
  //   select(state => ({
  //     ...state,
  //     node: { title: 'hello world' },
  //     block: { uid: '1', children: [{ uid: '2' }] },
  //   })),
  // )
  nodeElStore.update(setProp('node', node))
}

export function fetchNode(ident: string) {
  // return nodeElStore.pipe(
  //   select(state => ({
  //     ...state,
  //     node: { title: 'hello world' },
  //     block: { uid: '1', children: [{ uid: '2' }] },
  //   })),
  // )
  setNode({
    db: {},
    block: {
      uid: '1',
      // children: [{ uid: '2' }, { uid: '3' }, { uid: '4' }],
    },
    node: { title: 'hello world' + ident },
    page: {},
  })

  blocksStore.update(
    addEntities([
      { uid: '1', parentUid: '-1', order: 0, str: '111', childrenUids: ['2', '3', '4'], pageTitle: 'nodeTitle' },
      { uid: '2', parentUid: '1', order: 0, str: '222', childrenUids: [] },
      { uid: '3', parentUid: '1', order: 1, str: '333', childrenUids: [] },
      { uid: '4', parentUid: '1', order: 2, str: '444', childrenUids: [] },
    ]),
  )
}

export function syncTitle(title: string) {
  const state = nodeElStore.getValue()
  if (title !== state.title.initial) {
    nodeElStore.update(
      setProp('title', {
        initial: title,
        local: title,
      }),
    )
  }
}

// export const dispatchBlockOpen = (uid: string, open: boolean) => {
//   blocksStore.update(updateEntities(uid, { open }))
// }

// const blockElStore = createStore(
//   { name: 'blockElStore' },
//   // withEntities<BlockProps, 'uid'>({ idKey: 'uid' }),
//   withProps<BlockElState>({
//     string: {
//       local: null,
//       previous: null,
//     },
//     search: {
//       type: null,
//       results: null,
//       query: null,
//       index: null,
//     },
//     dragging: false,
//     dragTarget: null,
//     lastKeydown: null,
//     contextMenu: {
//       x: null,
//       y: null,
//       show: false,
//     },
//     createPosition: null,
//     showEditableDom: false,
//   }),
// )

// export const blockElState$ = blockElStore.pipe(select(state => state))

// export const updateBlockElStateProps = (state: Partial<BlockElState>) => {
//   blockElStore.update(setProps(state))
// }
