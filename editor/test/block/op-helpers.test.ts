import { addEntities } from '@ngneat/elf-entities'
import { blockRepo } from '../../src/stores/block.repository'
import {
  getNextBlock,
  getNthSiblingBlock,
  getPrevBlock,
} from '../../src/op/helpers'
import { Block } from '../../src/interfaces'

/**
 *  a0
 *  + b1
 *    + c4
 *    + c5
 *      + e8
 *  - b2
 *    (- d6)
 *    (- d7)
 *  - b3
 */

const blocks: Block[] = [
  {
    uid: 'a0',
    str: '0',
    order: 0,
    parentUid: null,
    childrenUids: ['b1', 'b2', 'b3'],
    open: true,
  },
  {
    uid: 'b1',
    str: '1',
    order: 0,
    parentUid: 'a0',
    childrenUids: ['c4', 'c5'],
    open: true,
  },
  {
    uid: 'b2',
    str: '2',
    order: 1,
    parentUid: 'a0',
    childrenUids: ['d6', 'd7'],
    open: false,
  },
  {
    uid: 'b3',
    str: '3',
    order: 2,
    parentUid: 'a0',
    childrenUids: [],
    open: false,
  },
  {
    uid: 'c4',
    str: '4',
    order: 0,
    parentUid: 'b1',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'c5',
    str: '5',
    order: 1,
    parentUid: 'b1',
    childrenUids: ['e8'],
    open: true,
  },
  {
    uid: 'd6',
    str: '6',
    order: 0,
    parentUid: 'b2',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'd7',
    str: '7',
    order: 1,
    parentUid: 'b2',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'e8',
    str: '8',
    order: 0,
    parentUid: 'c5',
    childrenUids: [],
    open: true,
  },
]

const [a0, b1, b2, b3, c4, c5, d6, d7, e8] = blocks

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('getNthSiblingBlock()', () => {
  const p = blocks[0]
  const b = blocks

  expect(getNthSiblingBlock(b[1], p, 0)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [
        "c4",
        "c5",
      ],
      "open": true,
      "order": 0,
      "parentUid": "a0",
      "str": "1",
      "uid": "b1",
    }
  `)
  expect(getNthSiblingBlock(b[1], p, -1)).toMatchInlineSnapshot(`null`)
  expect(getNthSiblingBlock(b[1], p, -2)).toMatchInlineSnapshot(`null`)
  expect(getNthSiblingBlock(b[1], p, 1)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [
        "d6",
        "d7",
      ],
      "open": false,
      "order": 1,
      "parentUid": "a0",
      "str": "2",
      "uid": "b2",
    }
  `)
  expect(getNthSiblingBlock(b[1], p, 2)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [],
      "open": false,
      "order": 2,
      "parentUid": "a0",
      "str": "3",
      "uid": "b3",
    }
  `)

  expect(getNthSiblingBlock(b[5], p, -1)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [
        "c4",
        "c5",
      ],
      "open": true,
      "order": 0,
      "parentUid": "a0",
      "str": "1",
      "uid": "b1",
    }
  `)
})

it('getPrevBlock()', () => {
  const p = blocks[0]
  const b = blocks

  expect(getPrevBlock(b[1], p)).toEqual(b[0])
  expect(getPrevBlock(b[5], p)).toEqual(b[4])
})

it('getNextBlock()', () => {
  expect(getNextBlock(a0)).toEqual(b1)
  expect(getNextBlock(c4)).toEqual(c5)
  expect(getNextBlock(c5)).toEqual(e8)
  expect(getNextBlock(e8)).toEqual(b2)
  expect(getNextBlock(b2)).toEqual(b3)
  expect(getNextBlock(e8)).toEqual(b2)
})
