import { Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

const datomic: Record<string, string> = {
  A: 'AAA',
  B: 'BBB',
}

const db = {
  data: datomic,
  save(k: string, v: string): void {
    this.data = {
      ...this.data,
      k: v,
    }
  },
}

const editingUid$ = new Subject<string | null>()

const dispatch = {
  editingUid(uid: string): void {
    editingUid$.next(uid)
  },
  saveBlock(uid: string, str: string): void {
    db.save(uid, str)
  },
}

const isEditing = (uid: string) => {
  return editingUid$.pipe(
    map(x => x === uid),
    distinctUntilChanged(),
  )
}

const isEditingA$ = isEditing('A')

const sub = editingUid$.subscribe({
  next: v => console.log(`editingUid: ${v}`),
})

isEditingA$.subscribe({
  next: v => console.log(`isEditingA: ${v}`),
})
// subject.subscribe({})

// editingUid$.next('A')
// editingUid$.next(null)
// editingUid$.next('B')
// editingUid$.next('C')
// editingUid$.next('D')
// editingUid$.next('A')

// sub.unsubscribe()

// editingUid$.next('X')
