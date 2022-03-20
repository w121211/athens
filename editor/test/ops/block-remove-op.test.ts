import { addEntities, getAllEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockRemoveOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { blocks, getAllBlockUids } from '../helpers'

/**
 *  a0
 *  - b1
 *    - c3
 *       -d5
 *    - c4
 *  - b2
 */
const [a0, b1, b2, c3, c4, d5] = blocks

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

it('blockRemoveOp() root', () => {
  blocksStore.update(...blockRemoveOp(a0))
  expect(getAllBlockUids()).toEqual([])
  validateChildrenUids(blocksStore.getValue().entities)

  expect(() => {
    blockRemoveOp(a0)
  }).toThrowErrorMatchingInlineSnapshot(`"[getBlock] Block not found"`)
})

it('blockRemoveOp() children', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       -d5
   *    - c4
   *  - b2*
   */
  blocksStore.update(...blockRemoveOp(b2))
  expect(getAllBlockUids()).toEqual('a0 b1 c3 c4 d5'.split(' '))
  validateChildrenUids(blocksStore.getValue().entities)

  /**
   *  a0
   *  - b1
   *    - c3*
   *       -d5
   *    - c4
   */
  blocksStore.update(...blockRemoveOp(c3))
  expect(getAllBlockUids()).toEqual('a0 b1 c4'.split(' '))
  validateChildrenUids(blocksStore.getValue().entities)

  /**
   *  a0
   *  - b1*
   *    - c4
   */
  blocksStore.update(...blockRemoveOp(b1))
  expect(getAllBlockUids()).toEqual(['a0'])
  validateChildrenUids(blocksStore.getValue().entities)
})
