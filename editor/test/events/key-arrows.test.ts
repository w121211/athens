import { addEntities } from '@ngneat/elf-entities'
import { events } from '../../src/events'
import { blockRepo, blocksStore, getBlock } from '../../src/stores/block.repository'
import { rfdbRepo } from '../../src/stores/rfdb.repository'

const blocks: Block[] = [
  { uid: '0', str: '0', order: 0, parentUid: null, childrenUids: ['1', '2', '3'] },
  { uid: '1', str: '1', order: 0, parentUid: '0', childrenUids: [] },
  { uid: '2', str: '2', order: 1, parentUid: '0', childrenUids: [] },
  { uid: '3', str: '3', order: 2, parentUid: '0', childrenUids: [] },
]

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('enterNewBlock()', () => {
  rfdbRepo.setProps({ editing: { uid: '0' } })

  const parent = blocks[0],
    block = blocks[1]

  // events.up('1', 'end')
  events.enterNewBlock(block, parent, 'x')
  expect(blocksStore.getValue().entities).toMatchSnapshot()

  // expect(rfdbRepo.getValue().editing?.uid).toEqual('1')
})

it('enterNewBlock, enterNewBlock, up', () => {
  rfdbRepo.setProps({ editing: { uid: '0' } })

  const parent = blocks[0]

  // events.up('1', 'end')
  events.enterNewBlock(blocks[1], parent, 'x')
  expect(rfdbRepo.getValue().editing?.uid).toEqual('x')

  events.up('x', 0)
  expect(rfdbRepo.getValue().editing?.uid).toEqual('1')

  events.enterNewBlock(getBlock('x'), parent, 'y')
  expect(blocksStore.getValue().entities).toMatchSnapshot()
  expect(rfdbRepo.getValue().editing?.uid).toEqual('y')

  events.up('y', 0)
  expect(rfdbRepo.getValue().editing?.uid).toEqual('x')

  // expect(rfdbRepo.getValue().editing?.uid).toEqual('1')
})

it('up()', () => {
  rfdbRepo.setProps({ editing: { uid: '1' } })
  events.up('0', 'end')
  expect(rfdbRepo.getValue().editing?.uid).toEqual('0')

  // const x = { uid: 'x', str: 'x', order: 0, parentUid: 'x', childrenUids: [] }

  // expect(insert(v, x, 'first', v[0])).toEqual([x, ...v])
  // expect(insert(v, x, 'first', v[1])).toEqual([x, ...v])
  // expect(insert(v, x, 'first', v[2])).toEqual([x, ...v])

  // expect(insert(v, x, 'last', v[0])).toEqual([...v, x])
  // expect(insert(v, x, 'last', v[1])).toEqual([...v, x])
  // expect(insert(v, x, 'last', v[2])).toEqual([...v, x])

  // // console.log(insert(v, x, 'before', v[0]))
  // expect(insert(v, x, 'before', v[0])).toEqual([x, ...v])
  // expect(insert(v, x, 'before', v[1])).toEqual([v[0], x, v[1], v[2]])
  // expect(insert(v, x, 'before', v[2])).toEqual([v[0], v[1], x, v[2]])

  // expect(insert(v, x, 'after', v[0])).toEqual([v[0], x, v[1], v[2]])
  // expect(insert(v, x, 'after', v[1])).toEqual([v[0], v[1], x, v[2]])
  // expect(insert(v, x, 'after', v[2])).toEqual([...v, x])
})

it('down()', () => {
  rfdbRepo.setProps({ editing: { uid: '1' } })
  events.up('0', 'end')
  expect(rfdbRepo.getValue().editing?.uid).toEqual('0')

  // const x = { uid: 'x', str: 'x', order: 0, parentUid: 'x', childrenUids: [] }

  // expect(insert(v, x, 'first', v[0])).toEqual([x, ...v])
  // expect(insert(v, x, 'first', v[1])).toEqual([x, ...v])
  // expect(insert(v, x, 'first', v[2])).toEqual([x, ...v])

  // expect(insert(v, x, 'last', v[0])).toEqual([...v, x])
  // expect(insert(v, x, 'last', v[1])).toEqual([...v, x])
  // expect(insert(v, x, 'last', v[2])).toEqual([...v, x])

  // // console.log(insert(v, x, 'before', v[0]))
  // expect(insert(v, x, 'before', v[0])).toEqual([x, ...v])
  // expect(insert(v, x, 'before', v[1])).toEqual([v[0], x, v[1], v[2]])
  // expect(insert(v, x, 'before', v[2])).toEqual([v[0], v[1], x, v[2]])

  // expect(insert(v, x, 'after', v[0])).toEqual([v[0], x, v[1], v[2]])
  // expect(insert(v, x, 'after', v[1])).toEqual([v[0], v[1], x, v[2]])
  // expect(insert(v, x, 'after', v[2])).toEqual([...v, x])
})
