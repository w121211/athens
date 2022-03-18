import { addEntities } from '@ngneat/elf-entities'
import { blockRepo } from '../../src/stores/block/block.repository'
import { getNthSiblingBlock, getPrevBlock } from '../../src/stores/block/helpers'
import { insert, reorder } from '../../src/stores/block/order'
import { Block } from '../../src/stores/block/types'

const blocks: Block[] = [
  { uid: '0', str: '0', order: 0, parentUid: null, childrenUids: ['1', '300', '301', '2', '3'], open: true },
  { uid: '1', str: '1', order: 0, parentUid: '0', childrenUids: [], open: true },
  { uid: '2', str: '2', order: 1, parentUid: '0', childrenUids: [], open: true },
  { uid: '3', str: '3', order: 2, parentUid: '0', childrenUids: [], open: true },
  { uid: '300', str: '', open: true, childrenUids: [], order: 1, parentUid: '1' },
  { uid: '301', str: '', open: true, childrenUids: [], order: 2, parentUid: '1' },
]

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('getNthSiblingBlock()', () => {
  const p = blocks[0]
  const b = blocks

  expect(getNthSiblingBlock(b[1], p, 0)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [],
      "open": true,
      "order": 0,
      "parentUid": "0",
      "str": "1",
      "uid": "1",
    }
  `)
  expect(getNthSiblingBlock(b[1], p, -1)).toMatchInlineSnapshot(`null`)
  expect(getNthSiblingBlock(b[1], p, -2)).toMatchInlineSnapshot(`null`)
  expect(getNthSiblingBlock(b[1], p, 1)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [],
      "open": true,
      "order": 1,
      "parentUid": "1",
      "str": "",
      "uid": "300",
    }
  `)
  expect(getNthSiblingBlock(b[1], p, 2)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [],
      "open": true,
      "order": 2,
      "parentUid": "1",
      "str": "",
      "uid": "301",
    }
  `)

  expect(getNthSiblingBlock(b[5], p, -1)).toMatchInlineSnapshot(`
    Object {
      "childrenUids": Array [],
      "open": true,
      "order": 1,
      "parentUid": "1",
      "str": "",
      "uid": "300",
    }
  `)
})

it('getPrevBlock()', () => {
  const p = blocks[0]
  const b = blocks

  expect(getPrevBlock(b[1], p)).toEqual(b[0])
  expect(getPrevBlock(b[5], p)).toEqual(b[4])
})
