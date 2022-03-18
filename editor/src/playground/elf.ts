import { createStore, withProps, select, setProp } from '@ngneat/elf'
import {
  getAllEntities,
  getEntity,
  selectAllEntities,
  selectAllEntitiesApply,
  selectEntities,
  selectEntity,
  selectEntityByPredicate,
  selectManyByPredicate,
  setEntities,
  updateEntities,
  upsertEntities,
  withEntities,
} from '@ngneat/elf-entities'
import { combineLatest, combineLatestAll, distinctUntilChanged, map, Observable, switchMap, take, tap } from 'rxjs'

interface BlockProps {
  uid: string
  str: string
  parentUid: string | null
}

interface EditingProps {
  editingUid: string | null
}

const blocksStore = createStore(
  { name: 'blocks' },
  withEntities<BlockProps, 'uid'>({
    idKey: 'uid',
    initialValue: [
      { uid: 'A', str: 'AAA', parentUid: null },
      { uid: 'B', str: 'BBB', parentUid: null },
      { uid: 'C', str: 'CCC', parentUid: 'A' },
      { uid: 'D', str: 'DDD', parentUid: 'A' },
    ],
  }),
  withProps<EditingProps>({ editingUid: null }),
)

const editingUid$ = blocksStore.pipe(select(state => state.editingUid))

// const editingStore = createStore(
//   { name: 'editing' },
//   withProps<EditingProps>({ editingUid: null }),
// )

const blockSave = (uid: string, str: string) => {
  blocksStore.update(updateEntities(uid, { str: str }))
}

const blockEditingUid = (uid: string) => {
  blocksStore.update(setProp('editingUid', uid))
}

const blockIsEditing = (uid: string) => {
  return editingUid$.pipe(
    map(x => x === uid),
    distinctUntilChanged(),
  )
}

const getBlock$ = (uid: string) => {
  return blocksStore.pipe(
    selectEntity(uid),
    tap(v => console.log(`blockA   ${v ? v.uid + '-' + v.str : v}`)),
  )
}

const getChildren$ = (uid: string) => {
  const blocks = blocksStore.query(getAllEntities())
  const children = blocks.filter(e => e.parentUid === uid)
  const children$ = children.map(e => getBlock$(e.uid))

  return combineLatest(children$).pipe(
    switchMap(x => {
      console.log(
        'switchMap',
        x.map(e => e?.uid),
      )
      // return getBlock$(uid).pipe(take(1))
      const blocks = blocksStore.query(getAllEntities())
      const children = blocks.filter(e => e.parentUid === uid)
      const children$ = children.map(e => getBlock$(e.uid))
      // return combineLatest(children$).pipe(take(1))
      return combineLatest(children$).pipe()
    }),
    // combineLatestAll(),
  )

  return getBlock$(uid).pipe(
    // map(x => {
    //   console.log('map')
    //   return x?.uid + '*'
    // }),

    switchMap(x => {
      console.log('switchMap', x?.uid)
      // return getBlock$(uid).pipe(take(1))
      const blocks = blocksStore.query(getAllEntities())
      const children = blocks.filter(e => e.parentUid === x?.uid)
      const children$ = children.map(e => getBlock$(e.uid))
      // return combineLatest(children$).pipe(take(1))
      return combineLatest(children$).pipe()
    }),

    // switchMap(x => {
    // const blocks = blocksStore.query(getAllEntities())
    // console.log(blocks)
    //   console.log('switchMap', x?.uid)
    //   // return blocksStore.pipe(
    //   //   selectAllEntitiesApply({
    //   //     filterEntity: e => e.parentUid === x?.uid,
    //   //   }),
    //   // )
    //   const blocks = blocksStore.query(getAllEntities())
    //   const children = blocks.filter(e => e.parentUid === x?.uid)
    //   const children$ = children.map(e => getBlock$(e.uid))
    //   return combineLatest(children$)
    // }),
    // tap(x => {
    //   console.log('children', x)
    // }),
  )
}

// const blocks$ = blocksStore.pipe(selectAllEntities()).subscribe(x => console.log(x))

const blockA$ = getBlock$('A').subscribe(console.log)
// blockA$.subscribe({
//   next: v => {
//     console.log(`blockA   ${v ? v.uid + '-' + v.str : v}`)
//   },
// })

console.log('-----' + 'case: update one item will trigger others get fired?')

blockSave('A', 'XXX')
blockSave('B', 'YYY')
blockSave('Z', 'ZZZ') // should not work

console.log('-----' + 'case: fired only if current block is editing')

const blockIsEditingA$ = blockIsEditing('A').subscribe(console.log)

blockEditingUid('A')
blockEditingUid('B')
blockEditingUid('C')
blockEditingUid('D')
blockEditingUid('E')

console.log('-----' + 'case: update children should not trigger parent fired')

const childrenOfA$ = getChildren$('A').subscribe(console.log)

console.log('B: should not fire')
blocksStore.update(updateEntities('B', { str: 'XXX' }))

console.log('C: should fire')
blocksStore.update(updateEntities('C', { str: 'XXX' }))

console.log('D: should fire')
blocksStore.update(updateEntities('D', { parentUid: 'B' }))
blocksStore.update(updateEntities('D', { str: 'XXX' }))

console.log('A: should fire')
blocksStore.update(updateEntities('A', { str: 'XXX' }))
