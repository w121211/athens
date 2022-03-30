import { setEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockMergeWithUpdatedChainOp } from '../../src/op/ops'
import {
  blockRepo,
  blocksStore,
  getBlock,
} from '../../src/stores/block.repository'
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
 *       - d9
 *       - d10
 *    - c6
 *  - b2
 */
beforeEach(() => {
  blockRepo.update([setEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

/**
 * sibling
 * parent
 *
 * sibling-descendant
 * parent
 * parent-sibling
 * ancestor
 * ancestor-sibling
 * descendant @throws error
 */

describe('blockMergeWithUpdatedChainOp()', () => {
  /**
   *  a0
   *  - b1
   *    - c3 (merge)
   *       - d5
   *       - d7
   *         - e8
   *    - c4 (remove)
   *       - d9
   *       - d10
   *    - c6
   *  - b2
   */

  it('merge with previous sibling', () => {
    const remove = getBlock('c4'),
      merge = getBlock('c3')
    blockRepo.updateInChain(
      blockMergeWithUpdatedChainOp(remove, merge, remove.str, merge.str),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['c4']).toMatchInlineSnapshot(
      `undefined`,
    )
    expect(blocksStore.getValue().entities['c3'].str).toMatchInlineSnapshot(
      `"c3c4"`,
    )
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d5",
        "d7",
        "d9",
        "d10",
      ]
    `)
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c3",
        "c6",
      ]
    `)
  })

  /**
   *  a0
   *  - b1
   *    - c3 (remove)
   *       - d5
   *       - d7
   *         - e8
   *    - c4 (merge)
   *       - d9
   *       - d10
   *    - c6
   *  - b2
   */

  it('merge with next sibling', () => {
    const remove = getBlock('c3'),
      merge = getBlock('c4')
    blockRepo.updateInChain(
      blockMergeWithUpdatedChainOp(remove, merge, remove.str, merge.str),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['c3']).toMatchInlineSnapshot(
      `undefined`,
    )
    expect(blocksStore.getValue().entities['c4'].str).toMatchInlineSnapshot(
      `"c4c3"`,
    )
    expect(blocksStore.getValue().entities['c4'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d9",
        "d10",
        "d5",
        "d7",
      ]
    `)
    expect(blocksStore.getValue().entities['b1'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "c4",
        "c6",
      ]
    `)
  })

  /**
   *  a0
   *  - b1
   *    - c3 (merge)
   *       - d5 (remove)
   *       - d7
   *         - e8
   *    - c4
   *       - d9
   *       - d10
   *    - c6
   *  - b2
   */

  it('merge with parent', () => {
    const remove = getBlock('d5'),
      merge = getBlock('c3')
    blockRepo.updateInChain(
      blockMergeWithUpdatedChainOp(remove, merge, remove.str, merge.str),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(blocksStore.getValue().entities['d5']).toMatchInlineSnapshot(
      `undefined`,
    )
    expect(blocksStore.getValue().entities['c3'].str).toMatchInlineSnapshot(
      `"c3d5"`,
    )
    expect(blocksStore.getValue().entities['c3'].childrenUids)
      .toMatchInlineSnapshot(`
      Array [
        "d7",
      ]
    `)
  })
})
