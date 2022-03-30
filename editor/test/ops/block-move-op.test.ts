import { setEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockMoveOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { blocks } from '../helpers'

// jest.spyOn(console, 'error')
// // @ts-ignore jest.spyOn adds this functionallity
// console.error.mockImplementation(() => null)

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
const [a0, b1, b2, c3, c4, d5, c6] = blocks

beforeEach(() => {
  blockRepo.update([setEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

it('blockMoveOp() move freely', () => {
  expect(() => {
    blockMoveOp(a0, { blockUid: 'b1', relation: 'after' })
  }).toThrowErrorMatchingInlineSnapshot(
    `"[blockMoveOp] block to be moved is a page, cannot move pages."`,
  )

  /**
   *  a0
   *  - b1*
   *    - c3
   *      - d5
   *    - &&
   *    - c4
   *      - &&
   *    - c6
   *  - b2
   *
   */
  expect(() => {
    blockMoveOp(b1, { blockUid: 'c3', relation: 'after' })
  }).toThrowErrorMatchingInlineSnapshot(
    `"[blockMoveOp] refBlock is descendant of block"`,
  )
  expect(() => {
    blockMoveOp(b1, { blockUid: 'c4', relation: 'first' })
  }).toThrowErrorMatchingInlineSnapshot(
    `"[blockMoveOp] refBlock is descendant of block"`,
  )

  /**
   *  a0
   *  - b1*
   *  - b2
   *  - &&
   */
  blocksStore.update(...blockMoveOp(b1, { blockUid: 'b2', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b2",
      "b1",
    ]
  `)
  // it should not alter x's children

  expect(blocksStore.getValue().entities['b1'].childrenUids).toEqual(
    b1.childrenUids,
  )

  /**
   *  a0
   *  - &&
   *  - b2
   *  - b1*
   */
  blocksStore.update(...blockMoveOp(b1, { blockUid: 'b2', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
      "b2",
    ]
  `)

  /**
   *  a0
   *  - b1*
   *  - &&
   *  - b2
   */
  blocksStore.update(...blockMoveOp(b1, { blockUid: 'b2', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
     Array [
       "b1",
       "b2",
     ]
   `)

  /**
   *  a0
   *  - b1*
   *  - b2
   *    - &&
   */
  blocksStore.update(...blockMoveOp(b1, { blockUid: 'b2', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b2",
    ]
  `)
  expect(blocksStore.getValue().entities['b2'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
    ]
  `)
})

it('blockMoveOp() :before a parent', () => {
  /**
   *  a0
   *  - b1
   *    - &&
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'c3', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
      "c3",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :after a parent', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - &&
   *    - c4
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'c3', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "d5",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :first a parent', () => {
  /**
   *  a0
   *  - b1
   *    - &&
   *    - c3
   *       -d5
   *    - c4*
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'b1', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
    ]
  `)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c4",
      "c3",
      "c6",
    ]
  `)
})

it('blockMoveOp() :last a parent', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - c4*
   *    - c6
   *    - &&
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'b1', relation: 'last' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
    ]
  `)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "c6",
      "c4",
    ]
  `)
})

it('blockMoveOp() :before an ancestor', () => {
  /**
   *  a0
   *  - &&
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b1', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
      "b1",
      "b2",
    ]
  `)
})

it('blockMoveOp() :aftre an ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - &&
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b1', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
      "d5",
      "b2",
    ]
  `)
})

it('blockMoveOp() :first an ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - &&
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b1', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
      "c3",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :last an ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *    - &&
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b1', relation: 'last' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "c4",
      "c6",
      "d5",
    ]
  `)
})

it('blockMoveOp() :before a sibling', () => {
  /**
   *  a0
   *  - b1
   *    - &&
   *    - c3
   *       - d5
   *    - c4*
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'c3', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c4",
      "c3",
      "c6",
    ]
  `)
})

it('blockMoveOp() :after a sibling', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       - d5
   *    - c4*
   *    - &&
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'c3', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :first a sibling', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       - &&
   *       - d5
   *    - c4*
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'c3', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "c6",
    ]
  `)
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c4",
      "d5",
    ]
  `)
})

it('blockMoveOp() :last a sibling', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       - d5
   *       - &&
   *    - c4*
   *    - c6
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(c4, { blockUid: 'c3', relation: 'last' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "c6",
    ]
  `)
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
      "c4",
    ]
  `)
})

it('blockMoveOp() :before a sibling ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - &&
   *  - b2
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b2', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
      "d5",
      "b2",
    ]
  `)
})

it('blockMoveOp() :after a sibling ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *  - &&
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b2', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
      "b2",
      "d5",
    ]
  `)
})

it('blockMoveOp() :first a sibling ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *    - &&
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b2', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b2'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
    ]
  `)
})

it('blockMoveOp() :last a sibling ancestor', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5*
   *    - c4
   *    - c6
   *  - b2
   *    - &&
   *
   *
   */
  blocksStore.update(...blockMoveOp(d5, { blockUid: 'b2', relation: 'last' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(
    blocksStore.getValue().entities['c3'].childrenUids,
  ).toMatchInlineSnapshot(`Array []`)
  expect(blocksStore.getValue().entities['b2'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
    ]
  `)
})

it('blockMoveOp() :before a sibling-descendat', () => {
  /**
   *  a0
   *  - b1
   *    - &&
   *    - c3
   *       -d5
   *    - c4
   *    - c6
   *  - b2*
   *
   */
  blocksStore.update(...blockMoveOp(b2, { blockUid: 'c3', relation: 'before' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
    ]
  `)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b2",
      "c3",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :after a sibling-descendat', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - &&
   *    - c4
   *    - c6
   *  - b2*
   *
   */
  blocksStore.update(...blockMoveOp(b2, { blockUid: 'c3', relation: 'after' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
    ]
  `)
  expect(blocksStore.getValue().entities['b1'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "c3",
      "b2",
      "c4",
      "c6",
    ]
  `)
})

it('blockMoveOp() :first a sibling-descendat', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *      - &&
   *       -d5
   *    - c4
   *    - c6
   *  - b2*
   *
   */
  blocksStore.update(...blockMoveOp(b2, { blockUid: 'c3', relation: 'first' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
    ]
  `)
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b2",
      "d5",
    ]
  `)
})

it('blockMoveOp() :last a sibling-descendat', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *      - &&
   *    - c4
   *    - c6
   *  - b2*
   *
   */
  blocksStore.update(...blockMoveOp(b2, { blockUid: 'c3', relation: 'last' }))
  expect(() =>
    validateChildrenUids(blocksStore.getValue().entities),
  ).not.toThrow()
  expect(blocksStore.getValue().entities['a0'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "b1",
    ]
  `)
  expect(blocksStore.getValue().entities['c3'].childrenUids)
    .toMatchInlineSnapshot(`
    Array [
      "d5",
      "b2",
    ]
  `)
})
