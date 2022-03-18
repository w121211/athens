import { actionsFactory, createAction, createEffect, createEffectFn, initEffects, ofType, props } from '@ngneat/effects'
import { createStore, withProps, select, setProp } from '@ngneat/elf'
import {
  getAllEntities,
  getEntity,
  selectAllEntities,
  selectAllEntitiesApply,
  selectEntities,
  selectEntity,
  selectEntityByPredicate,
  selectManyByPredicate,
  setEntities,
  updateEntities,
  upsertEntities,
  withEntities,
} from '@ngneat/elf-entities'
import { Observable } from 'rxjs'
import { debounceTime, delay, finalize, mergeMap, tap } from 'rxjs/operators'
// import { prependTodo, setTodos, Todo, updateLoading } from './todos.repository'

interface BlockProps {
  uid: string
  str: string
  parentUid: string | null
}

interface EditingProps {
  editingUid: string | null
}

const blocksStore = createStore(
  { name: 'blocks' },
  withEntities<BlockProps, 'uid'>({
    idKey: 'uid',
    initialValue: [
      { uid: 'A', str: 'AAA', parentUid: null },
      { uid: 'B', str: 'BBB', parentUid: null },
      { uid: 'C', str: 'CCC', parentUid: 'A' },
      { uid: 'D', str: 'DDD', parentUid: 'A' },
    ],
  }),
  withProps<EditingProps>({ editingUid: null }),
)

initEffects()

const todoActions = actionsFactory('todo')
const loadTodos = todoActions.create('Load Todos')
const addTodo = todoActions.create('Add Todo', props<Todo>())

export const loadTodos$ = createEffect(actions =>
  actions.pipe(
    ofType(loadTodos),
    mergeMap(() => {
      return fetch('https://jsonplaceholder.typicode.com/todos').then(res => res.json())
    }),
    tap(todos => {
      // blocksStore.pipe
      // updateLoading(false)
      // setTodos(todos)
    }),
  ),
)

export const addTodo$ = createEffect(actions =>
  actions.pipe(
    ofType(addTodo),
    delay(300),
    tap(props => prependTodo(props)),
  ),
)

export const searchTodoEffect = createEffectFn((searchTerm$: Observable<string>) => {
  return searchTerm$.pipe(
    debounceTime(300),
    finalize(() => {
      console.log('finalize searchTodoEffect')
    }),
    tap({
      next(v) {
        console.log(v)
      },
    }),
  )
})
