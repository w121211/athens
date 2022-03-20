import { diff } from 'deep-object-diff'
import { Block } from '../../src/interfaces'
import { insert, moveBetween, moveWithin, reorder } from '../../src/op/order'
import { blocks } from '../helpers'

// jest.spyOn(console, 'error')
// // @ts-ignore jest.spyOn adds this functionallity
// console.error.mockImplementation(() => null)

// beforeEach(() => {})

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

it('moveBetween()', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - c4
   *    - c6
   *  - b2
   *
   */
  const [a0, b1, b2, c3, c4, d5, c6] = blocks,
    va = [a0],
    vb = [b1, b2],
    vc = [c3, c4, c6],
    vd = [d5]

  expect(() =>
    expect(moveBetween(va, vc, a0, 'before', a0)),
  ).toThrowErrorMatchingInlineSnapshot(
    `"[moveBetween] x and ref are the same block"`,
  )
  expect(() =>
    expect(moveBetween(va, vc, b1, 'before', c3)),
  ).toThrowErrorMatchingInlineSnapshot(`"[moveBetween] x is not in src"`)
  expect(() =>
    expect(moveBetween(va, vc, a0, 'before', d5)),
  ).toThrowErrorMatchingInlineSnapshot(`"[moveBetween] ref is not in dest"`)

  expect(moveBetween(va, vc, a0, 'before', c3)).toEqual([[], [a0, ...vc]])
  expect(moveBetween(va, vc, a0, 'after', c3)).toEqual([[], [c3, a0, c4, c6]])
  expect(moveBetween(va, vc, a0, 'first', c3)).toEqual([[], [a0, ...vc]])
  expect(moveBetween(va, vc, a0, 'last', c3)).toEqual([[], [...vc, a0]])

  expect(moveBetween(vd, vc, d5, 'before', c3)).toEqual([[], [d5, ...vc]])
})

it('moveWithin()', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - c4
   *    - c6
   *  - b2
   *
   */
  const [a0, b1, b2, c3, c4, d5, c6] = blocks,
    va = [a0],
    vb = [b1, b2],
    vc = [c3, c4, c6],
    vd = [d5]

  expect(() =>
    moveWithin(vd, d5, 'before', d5),
  ).toThrowErrorMatchingInlineSnapshot(
    `"[moveWithin] x and ref are the same block"`,
  )

  expect(() =>
    moveWithin(va, b1, 'before', a0),
  ).toThrowErrorMatchingInlineSnapshot(`"[moveWithin] x is not in v"`)

  expect(() =>
    moveWithin(vc, c3, 'after', d5),
  ).toThrowErrorMatchingInlineSnapshot(`"[moveWithin] ref is not in v"`)

  expect(moveWithin(vb, b1, 'before', b2)).toEqual([b1, b2])
  expect(moveWithin(vb, b1, 'after', b2)).toEqual([b2, b1])

  expect(moveWithin(vc, c3, 'first', c4)).toEqual([c3, c4, c6])
  expect(moveWithin(vc, c3, 'first', c6)).toEqual([c3, c4, c6])
  expect(moveWithin(vc, c4, 'first', c3)).toEqual([c4, c3, c6])
  expect(moveWithin(vc, c4, 'first', c6)).toEqual([c4, c3, c6])

  expect(moveWithin(vc, c4, 'last', c3)).toEqual([c3, c6, c4])
  expect(moveWithin(vc, c4, 'last', c6)).toEqual([c3, c6, c4])
  expect(moveWithin(vc, c6, 'last', c3)).toEqual([c3, c4, c6])
  expect(moveWithin(vc, c6, 'last', c4)).toEqual([c3, c4, c6])
})

it('reorder()', () => {
  function print(blocks: Block[]) {
    return blocks.map((e) => `${e.uid}_${e.order}`).join(', ')
  }

  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - c4
   *    - c6
   *  - b2
   *
   */
  const [a0, b1, b2, c3, c4, d5, c6] = blocks,
    va = [a0],
    vb = [b1, b2],
    vc = [c3, c4, c6],
    vd = [d5]

  expect(print(reorder(vb, [...vb, a0]))).toEqual('a0_2')
  expect(print(reorder(vb, []))).toEqual('')

  expect(print(reorder(vb, [c3, d5]))).toEqual('c3_0, d5_1')
  expect(print(reorder(vc, [c3, d5]))).toEqual('d5_1')
  expect(print(reorder(vc, [c6, c4, c3]))).toEqual('c6_0, c3_2')
})
