import { setEntities } from '@ngneat/elf-entities'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockSplitChainOp } from '../../src/op/ops'
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

describe('blockSplitOp()', () => {
  /**
   *  a0
   *  - b1
   *    - c3
   *       - d5
   *       - d7
   *         - e8
   *    - (before)
   *    - c4*
   *      - (first)
   *      - d9
   *      - d10
   *      - (last)
   *    - (after)
   *    - c6
   *  - b2
   */

  it('before, index=0', () => {
    blockRepo.updateInChain(
      blockSplitChainOp(getBlock('c4'), 'x', 'helloworld', 0, 'before'),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(getBlock('b1').childrenUids).toMatchInlineSnapshot(`
      Array [
        "c3",
        "x",
        "c4",
        "c6",
      ]
    `)
    expect(getBlock('c4').str).toMatchInlineSnapshot(`""`)
    expect(getBlock('x')).toMatchInlineSnapshot(
      { editTime: expect.any(Number) },
      `
      Object {
        "childrenUids": Array [],
        "editTime": Any<Number>,
        "open": true,
        "order": 1,
        "parentUid": "b1",
        "str": "helloworld",
        "uid": "x",
      }
    `,
    )
  })

  it('after, index=5', () => {
    blockRepo.updateInChain(
      blockSplitChainOp(getBlock('c4'), 'x', 'helloworld', 5, 'after'),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(getBlock('b1').childrenUids).toMatchInlineSnapshot(`
      Array [
        "c3",
        "c4",
        "x",
        "c6",
      ]
    `)
    expect(getBlock('c4').str).toMatchInlineSnapshot(`"hello"`)
    expect(getBlock('x')).toMatchInlineSnapshot(
      { editTime: expect.any(Number) },
      `
      Object {
        "childrenUids": Array [],
        "editTime": Any<Number>,
        "open": true,
        "order": 2,
        "parentUid": "b1",
        "str": "world",
        "uid": "x",
      }
    `,
    )
  })

  it('first, index=5', () => {
    blockRepo.updateInChain(
      blockSplitChainOp(getBlock('c4'), 'x', 'helloworld', 5, 'first'),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(getBlock('c4').childrenUids).toMatchInlineSnapshot(`
      Array [
        "x",
        "d9",
        "d10",
      ]
    `)
    expect(getBlock('c4').str).toMatchInlineSnapshot(`"hello"`)
    expect(getBlock('x')).toMatchInlineSnapshot(
      { editTime: expect.any(Number) },
      `
      Object {
        "childrenUids": Array [],
        "editTime": Any<Number>,
        "open": true,
        "order": 0,
        "parentUid": "c4",
        "str": "world",
        "uid": "x",
      }
    `,
    )
  })

  it('last, index=5', () => {
    blockRepo.updateInChain(
      blockSplitChainOp(getBlock('c4'), 'x', 'helloworld', 5, 'last'),
    )
    expect(() =>
      validateChildrenUids(blocksStore.getValue().entities),
    ).not.toThrow()
    expect(getBlock('c4').childrenUids).toMatchInlineSnapshot(`
      Array [
        "d9",
        "d10",
        "x",
      ]
    `)
    expect(getBlock('c4').str).toMatchInlineSnapshot(`"hello"`)
    expect(getBlock('x')).toMatchInlineSnapshot(
      { editTime: expect.any(Number) },
      `
      Object {
        "childrenUids": Array [],
        "editTime": Any<Number>,
        "open": true,
        "order": 2,
        "parentUid": "c4",
        "str": "world",
        "uid": "x",
      }
    `,
    )
  })
})
