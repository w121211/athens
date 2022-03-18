import { insert, reorder } from '../../src/stores/block/order'
import { Block } from '../../src/stores/block/types'

// beforeAll(() => {
//   const blocks: Block[] = [
//     { uid: '1', str: '1', order: 0, parentUid: null, childrenUids: ['2', '3'], pageTitle: 'A' },
//     { uid: '2', str: '2', order: 0, parentUid: '1', childrenUids: [] },
//     { uid: '3', str: '3', order: 0, parentUid: '2', childrenUids: [] },
//   ]
// })

// type Blocktom = number | Blocktom[]

// function blockit(nestedIds: Blocktom) {
//   // for ()
// }

// blockit([1, [2, 3], [4, 5]])

it('insert()', () => {
  const v: Block[] = [
    { uid: '1', str: '1', order: 0, parentUid: '1', childrenUids: [] },
    { uid: '2', str: '2', order: 1, parentUid: '1', childrenUids: [] },
    { uid: '3', str: '3', order: 2, parentUid: '1', childrenUids: [] },
  ]

  const x = { uid: 'x', str: 'x', order: 0, parentUid: 'x', childrenUids: [] }

  expect(insert(v, x, 'first', v[0])).toEqual([x, ...v])
  expect(insert(v, x, 'first', v[1])).toEqual([x, ...v])
  expect(insert(v, x, 'first', v[2])).toEqual([x, ...v])

  expect(insert(v, x, 'last', v[0])).toEqual([...v, x])
  expect(insert(v, x, 'last', v[1])).toEqual([...v, x])
  expect(insert(v, x, 'last', v[2])).toEqual([...v, x])

  // console.log(insert(v, x, 'before', v[0]))
  expect(insert(v, x, 'before', v[0])).toEqual([x, ...v])
  expect(insert(v, x, 'before', v[1])).toEqual([v[0], x, v[1], v[2]])
  expect(insert(v, x, 'before', v[2])).toEqual([v[0], v[1], x, v[2]])

  expect(insert(v, x, 'after', v[0])).toEqual([v[0], x, v[1], v[2]])
  expect(insert(v, x, 'after', v[1])).toEqual([v[0], v[1], x, v[2]])
  expect(insert(v, x, 'after', v[2])).toEqual([...v, x])
})

// it('reorder()', () => {
//   const before: Block[] = [
//     { uid: '1', str: '1', order: 0, parentUid: '1', childrenUids: [] },
//     { uid: '2', str: '2', order: 1, parentUid: '1', childrenUids: [] },
//     { uid: '3', str: '3', order: 2, parentUid: '1', childrenUids: [] },
//   ]
//   const after: Block[] = [
//     { uid: '1', str: '1', order: 0, parentUid: '1', childrenUids: [] },
//     { uid: '3', str: '3', order: 2, parentUid: '1', childrenUids: [] },
//     { uid: '2', str: '2', order: 1, parentUid: '1', childrenUids: [] },
//   ]
//   // const after = [...before]
//   // after[2].order = 3

//   expect(reorder(after, before)).toEqual([])
// })
