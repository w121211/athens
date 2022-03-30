import { setEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockMoveChainOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { blocks } from '../helpers'

// jest.spyOn(console, 'error')
// // @ts-ignore jest.spyOn adds this functionallity
// console.error.mockImplementation(() => null)

/**
 *  a0
 *  - b1
 *    - c3
 *       - d5
 *       - d7
 *         - e8
 *    - c4
 *    - c6
 *  - b2
 */
beforeEach(() => {
  blockRepo.update([setEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

/**
 * sibling
 * sibling-descendant
 * parent
 * parent-sibling
 * ancestor
 * ancestor-sibling
 * descendant @throws error
 */

describe('blockMoveChain()', () => {
  /**
   * sibling
   *
   *  a0
   *  - b1
   *    - (before)
   *    - c3&
   *       - (first)
   *       - d5
   *       - d7
   *       - (last)
   *    - (after)
   *    - c4*
   *    - c6*
   *  - b2
   */
  it('before a sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('c3', ['c4', 'c6'], 'before'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
        "c3",
      ]
    `)
  })

  it('after a sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('c3', ['c4', 'c6'], 'after'))
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

  it('first a sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('c3', ['c4', 'c6'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
      ]
    `)
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
        "d5",
        "d7",
      ]
    `)
  })

  it('last a sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('c3', ['c4', 'c6'], 'last'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
      ]
    `)
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
        "c4",
        "c6",
      ]
    `)
  })

  /**
   * sibling-descendant
   *
   *  a0
   *  - b1
   *    - c3
   *       - d5
   *       - (before)
   *       - d7&
   *          - (first)
   *          - e8
   *          - (last)
   *       - (after)
   *    - c4*
   *    - c6*
   *  - b2
   */
  it('before a sibling-descendant', () => {
    blockRepo.updateInChain(blockMoveChainOp('d7', ['c4', 'c6'], 'before'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "c4",
        "c6",
        "d7",
      ]
    `)
  })

  it('after a sibling-descendant', () => {
    blockRepo.updateInChain(blockMoveChainOp('d7', ['c4', 'c6'], 'after'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
        "c4",
        "c6",
      ]
    `)
  })

  it('first a sibling-descendant', () => {
    blockRepo.updateInChain(blockMoveChainOp('d7', ['c4', 'c6'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['d7'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
        "e8",
      ]
    `)
  })

  it('last a sibling-descendant', () => {
    blockRepo.updateInChain(blockMoveChainOp('d7', ['c4', 'c6'], 'last'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['d7'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "e8",
        "c4",
        "c6",
      ]
    `)
  })

  /**
   * parent
   *
   *  a0
   *  - (before)
   *  - b1&
   *    - (first)
   *    - c3
   *       - d5
   *       - d7
   *          - e8
   *    - c4*
   *    - c6*
   *    - (last)
   *  - (after)
   *  - b2
   */
  it('before a parent', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['c4', 'c6'], 'before'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
        "b1",
        "b2",
      ]
    `)
  })

  it('after a parent', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['c4', 'c6'], 'after'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "c4",
        "c6",
        "b2",
      ]
    `)
  })

  it('first a parent', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['c4', 'c6'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
        "c3",
      ]
    `)
  })

  it('last a parent', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['c4', 'c6'], 'last'))
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

  /**
   * parent-sibling
   *
   *  a0
   *  - b1
   *    - c3*
   *       - d5
   *       - d7
   *          - e8
   *    - c4*
   *    - c6*
   *  - (before)
   *  - b2&
   *    - (first)
   *    - (last)
   *  - (after)
   */
  it('before a parent-sibling', () => {
    blockRepo.updateInChain(
      blockMoveChainOp('b2', ['c3', 'c4', 'c6'], 'before'),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "c3",
        "c4",
        "c6",
        "b2",
      ]
    `)
  })

  it('after a parent-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['c3', 'c4', 'c6'], 'after'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "b2",
        "c3",
        "c4",
        "c6",
      ]
    `)
  })

  it('first a parent-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['c3', 'c4', 'c6'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b2'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
        "c4",
        "c6",
      ]
    `)
  })

  it('last a parent-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['c3', 'c4', 'c6'], 'last'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b2'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
        "c4",
        "c6",
      ]
    `)
  })

  /**
   * ancestor
   *
   *  a0
   *  - (before)
   *  - b1&
   *  - (after)
   *    - (first)
   *    - c3
   *       - d5*
   *       - d7*
   *          - e8
   *    - c4
   *    - c6
   *    - (last)
   *  - b2
   */
  it('before an ancestor', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['d5', 'd7'], 'before'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
        "b1",
        "b2",
      ]
    `)
  })

  it('after an ancestor', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['d5', 'd7'], 'after'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "d5",
        "d7",
        "b2",
      ]
    `)
  })

  it('first an ancestor', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['d5', 'd7'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
        "c3",
        "c4",
        "c6",
      ]
    `)
  })

  it('last an ancestor', () => {
    blockRepo.updateInChain(blockMoveChainOp('b1', ['d5', 'd7'], 'last'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
        "c4",
        "c6",
        "d5",
        "d7",
      ]
    `)
  })

  /**
   * ancestor-sibling
   *
   *  a0
   *  - b1
   *    - c3
   *       - d5*
   *       - d7*
   *          - e8
   *    - c4
   *    - c6
   *  - (before)
   *  - b2&
   *    - (first)
   *    - (last)
   *  - (after)
   */
  it('before an ancestor-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['d5', 'd7'], 'before'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "d5",
        "d7",
        "b2",
      ]
    `)
  })

  it('after an ancestor-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['d5', 'd7'], 'after'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['a0'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "b1",
        "b2",
        "d5",
        "d7",
      ]
    `)
  })

  it('first an ancestor-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['d5', 'd7'], 'first'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b2'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
      ]
    `)
  })

  it('last an ancestor-sibling', () => {
    blockRepo.updateInChain(blockMoveChainOp('b2', ['d5', 'd7'], 'last'))
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['b2'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
      ]
    `)
  })

  /**
   * descendant
   *
   *  a0
   *  - b1*
   *    - c3&
   *       - d5
   *       - d7
   *    - c4
   *    - c6
   *  - b2*
   */
  it('before/after/first/last a descendant throws', () => {
    expect(() =>
      blockRepo.updateInChain(blockMoveChainOp('c3', ['b1', 'b2'], 'before')),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[blockMoveOp] refBlock is descendant of block"`,
    )
    expect(() =>
      blockRepo.updateInChain(blockMoveChainOp('c3', ['b1', 'b2'], 'after')),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[blockMoveOp] refBlock is descendant of block"`,
    )
    expect(() =>
      blockRepo.updateInChain(blockMoveChainOp('c3', ['b1', 'b2'], 'first')),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[blockMoveOp] refBlock is descendant of block"`,
    )
    expect(() =>
      blockRepo.updateInChain(blockMoveChainOp('c3', ['b1', 'b2'], 'last')),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[blockMoveOp] refBlock is descendant of block"`,
    )
  })
})
