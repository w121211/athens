import { debounceTime, Observable, of, tap } from 'rxjs'

const store = {
  debounceWriteDB: false,
  dbPicker: {
    selectedDB: 'selectedDB',
  },
}

function writeDB(copy?: boolean) {
  // fs write db
}

// function defaultDebounceWriteDB() {
// }

function fsWriteDB(debounceWriteDB$: Observable<boolean>) {
  return debounceWriteDB$.pipe(
    debounceTime(5 * 1000),
    tap(x => writeDB()),
  )
}

// export function fsWrite() {
//   fsWriteDB().subscribe()
// }
