import { setEntities, updateEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import {
  allDescendants,
  nextBlock,
  nthSiblingBlock,
  prevBlock,
} from '../../src/op/queries'
import {
  blockRepo,
  blocksStore,
  getBlock,
} from '../../src/stores/block.repository'
import { blocks } from '../helpers'

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

const [a0, b1, b2, c3, c4, d5, c6, d7, e8, d9, d10] = blocks

it('allDescendants()', () => {
  expect(allDescendants(a0).map((e) => e.uid)).toMatchInlineSnapshot(`
    Array [
      "b1",
      "b2",
      "c3",
      "c4",
      "c6",
      "d9",
      "d10",
      "d5",
      "d7",
      "e8",
    ]
  `)
  expect(allDescendants(b1).map((e) => e.uid)).toMatchInlineSnapshot(`
    Array [
      "c3",
      "c4",
      "c6",
      "d9",
      "d10",
      "d5",
      "d7",
      "e8",
    ]
  `)
  expect(allDescendants(b2)).toEqual([])
  expect(allDescendants(d7)).toEqual([e8])
  expect(allDescendants(d10)).toEqual([])
})

describe('nextBlock()', () => {
  /**
   * open
   *
   *  a0*
   *  - b1*
   *    - c3 (child)
   *       - d5*
   *       - d7 (sibling)
   *         - e8*
   *    - c4 (ancestor-sibling)
   *       - d9
   *       - d10*
   *    - c6 (parent-sibling)
   *  - b2* // next not exist
   */

  it('next of root', () => {
    expect(nextBlock(a0)).toEqual(b1)
  })

  it('next is child', () => {
    expect(nextBlock(b1)).toEqual(c3)
  })

  it('next is sibling', () => {
    expect(nextBlock(d5)).toEqual(d7)
  })

  it('next is ancestor-sibling', () => {
    expect(nextBlock(e8)).toEqual(c4)
  })

  it('next is parent-sibling', () => {
    expect(nextBlock(d10)).toEqual(c6)
  })

  it('next is not exist', () => {
    expect(nextBlock(b2)).toEqual(null)
  })

  /**
   * close
   *
   *  a0*
   *  - b1
   *    - c3
   *      - d5
   *      - d7*
   *        - ...
   *    - c4*
   *      - ...
   *    - c6
   *  - b2*
   */

  it('self close & next is parent-sibling', () => {
    blockRepo.update([updateEntities('d7', { open: false })])
    expect(nextBlock(getBlock('d7'))).toEqual(c4)
  })

  it('self close & next is sibling', () => {
    blockRepo.update([updateEntities('c4', { open: false })])
    expect(nextBlock(getBlock('c4'))).toEqual(c6)
  })
})

describe('nthSiblingBlock()', () => {
  /**
   *  a0
   *  - b1*
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

  it('throws for wrong parent input', () => {
    expect(() => {
      nthSiblingBlock(b1, b2, 0)
    }).toThrowErrorMatchingInlineSnapshot(
      `"[nthSiblingBlock] block.parentUid !== parent.uid"`,
    )
  })

  it('nth = 0,1,2,-1', () => {
    expect(nthSiblingBlock(b1, a0, 0)).toEqual(b1)
    expect(nthSiblingBlock(b1, a0, 1)).toEqual(b2)
    expect(nthSiblingBlock(b1, a0, 2)).toEqual(null)
    expect(nthSiblingBlock(b1, a0, -1)).toEqual(null)
  })

  it('nth = -1,-2', () => {
    expect(nthSiblingBlock(b2, a0, -1)).toEqual(b1)
    expect(nthSiblingBlock(b2, a0, -2)).toEqual(null)
  })
})

describe('prevBlock()', () => {
  /**
   * open
   *
   *  a0
   *  - b1
   *    - c3
   *       - d5
   *       - d7
   *         - e8 (sibling-kid)
   *    - c4 (parent) *
   *       - d9 (sibling) *
   *       - d10*
   *    - c6 (sibling-child)
   *  - b2*
   */

  it('throws for wrong parent input', () => {
    expect(() => {
      prevBlock(a0, b1)
    }).toThrowErrorMatchingInlineSnapshot(
      `"[nthSiblingBlock] block.parentUid !== parent.uid"`,
    )
  })

  it('prev is sibling-child', () => {
    expect(prevBlock(b2, a0)).toEqual(c6)
  })

  it('prev is sibling', () => {
    expect(prevBlock(d10, c4)).toEqual(d9)
  })

  it('prev is parent', () => {
    expect(prevBlock(d9, c4)).toEqual(c4)
  })

  it('prev is sibling-kid', () => {
    expect(prevBlock(c4, b1)).toEqual(e8)
  })
})
