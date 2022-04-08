/**
 * Code referenced from
 * https://github.com/ngneat/elf/blob/master/packages/state-history/src/lib/state-history.spec.ts
 *
 */
import { createStore, Store } from '@ngneat/elf'
import {
  addEntities,
  setEntities,
  updateEntities,
  withEntities,
} from '@ngneat/elf-entities'
import { stateHistory } from '@ngneat/elf-state-history'
import { inspect } from 'util'

interface Entity {
  id: number
  str: string
}

function eq(store: Store, entities: Entity[]) {
  expect(store.getValue().entities).toEqual(
    Object.fromEntries(entities.map((e) => [e.id, e])),
  )
}

function entity(id: number, str: string): Entity {
  return { id, str }
}

/**
 * consequence op with pause/resume
 *
 *
 */

const e1 = entity(1, '1'),
  e2 = entity(2, '2'),
  e3 = entity(3, '3')

describe('stateHistory', () => {
  it('batch update', () => {
    const store = createStore(
        { name: '' },
        withEntities<Entity>({ initialValue: [] }),
      ),
      history = stateHistory(store)

    eq(store, [])

    store.update(addEntities(e1), addEntities(e2))
    store.update(addEntities(e3))

    history.undo()
    eq(store, [e1, e2])

    history.undo()
    eq(store, [])

    history.undo()
    eq(store, [])

    history.redo()
    eq(store, [e1, e2])

    history.redo()
    eq(store, [e1, e2, e3])

    history.redo()
    eq(store, [e1, e2, e3])
  })

  it('consequence update with pause/resume', () => {
    const store = createStore(
        { name: '' },
        withEntities<Entity>({ initialValue: [] }),
      ),
      history = stateHistory(store)

    eq(store, [])

    store.update(addEntities(e1))
    eq(store, [e1])

    history.pause()

    store.update(updateEntities(e1.id, { str: '1a' }))
    store.update(updateEntities(e1.id, { str: '1ab' }))

    // resume need to place before the last op
    history.resume()

    store.update(updateEntities(e1.id, { str: '1abc' }))

    history.undo()
    eq(store, [e1])

    history.undo()
    eq(store, [])
  })
})
