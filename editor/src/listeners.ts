import * as events from './events'
import { rfdbRepo, rfdbStore } from './stores/rfdb.repository'
import { destructKeyDown, isShortcutKey } from './utils'

//
// Mouse events
//
//
//
//
//
//

function unfocus(event: globalThis.MouseEvent) {
  // const selectedItems = empty(subscribe('select-subs/items')),
  //   editingUid = subscribe('editing/uid'),
  const rfdb = rfdbStore.getValue(),
    selectedItems = rfdb.selectSubs?.items,
    editingUid = rfdb.editing?.uid,
    target = event.target as HTMLElement,
    closestBlock = target.closest('.block-content'),
    closestBlockHeader = target.closest('.block-header'),
    closestPageHeader = target.closest('.page-header'),
    closestBullet = target.closest('.anchor'),
    closestDropdown = target.closest('#dropdown-menu'),
    closest =
      closestBlock ?? closestBlockHeader ?? closestPageHeader ?? closestDropdown

  if (selectedItems && closestBullet === null) {
    // dispatch('select-events/clear')
  }
  if (closest === null && editingUid) {
    // dispatch('editing/uid', null)
    dispatch.editingUid('')
  }
}

//
// Keyboard events
//
//
//
//
//
//

/**
 * "When blocks are selected, handle various keypresses:
  - shift+up/down: increase/decrease selection.
  - enter: deselect and begin editing textarea
  - backspace: delete all blocks
  - up/down: change editing textarea
  - tab: indent/unindent blocks
  Can't use textarea-key-down from keybindings.cljs because textarea is no longer focused."
 */
export function multiBlockSelection(e: KeyboardEvent) {
  const selectedItems = rfdbRepo.getValue().selection.items

  if (selectedItems.length > 0) {
    const { shift, key } = destructKeyDown(e),
      enter = key === 'Enter',
      bksp = key === 'Backspace',
      up = key === 'ArrowUp',
      down = key === 'ArrowDown',
      tab = key === 'Tab',
      dlt = key === 'Delete'

    if (enter) {
      events.editingUid(selectedItems[0])
      events.selectionClear()
    } else if (bksp || dlt) {
      events.selectionDelete()
      events.selectionClear()
    } else if (tab) {
      e.preventDefault()

      if (shift) {
        events.unindentMulti(selectedItems)
      } else {
        events.indentMulti(selectedItems)
      }
    } else if (shift && up) {
      events.selectedUp(selectedItems)
    } else if (shift && down) {
      events.selectedDown(selectedItems)
    } else if (up || down) {
      e.preventDefault()
      events.selectionClear()

      if (up) {
        events.up(selectedItems[0], 'end')
      } else {
        events.down(selectedItems[selectedItems.length - 1], 'end')
      }
    }
  }
}

/**
 * @athens key-down!
 *
 * If redo, use browser's native undo/redo first
 */
// export function editorKeyDown(event: globalThis.KeyboardEvent) {
export function hotkey(event: KeyboardEvent) {
  const dKeyDown = destructKeyDown(event),
    { key, ctrl, meta, shift, alt } = dKeyDown
  // editingUid = rfdbRepo
  // editingUid = subscribe('editing/uid')

  if (isShortcutKey(meta, ctrl)) {
    switch (key) {
      case 's':
        // save
        break
      case 'k':
        // open search-all panel
        break
      case 'z':
        // reado/undo
        if (shift) {
          events.historyRedo()
        } else {
          console.debug('editor undo()')
          events.historyUndo()
        }
        break
    }
  }
}

//
// Clipboard
//
//
//
//
//
//

const unformatDoubleBrackets = () => {}

const blocksToClipboardData = (depth, node, unformat = false) => {
  const { string: _string, children, _header } = node.block,
    leftOffset = '    '.repeat(depth),
    walkChildren = children.map((e) =>
      blocksToClipboardData(depth++, e, unformat),
    ),
    // string = unformat ? _string
    dash = unformat ? '' : '- '
  return leftOffset + dash + string + '\n' + walkChildren
}

const copy = (js, e) => {
  const uids = subscribe('::select-subs/items')
  if (!empty(uids)) {
    const copyData = uids
        .map((e) => getReactiveBlockDocument(dsdb, [':block/uid', e]))
        .map((e) => blocksToClipboardData(0, e))
        .join(),
      clipboardData = e.event_.clipboardData,
      copiedBlocks = mapv(() => {
        getInternalRepresentation(dsdb, [':block/uid', uids]), uids
      })

    clipboardData.setData('text/plain', copyData)
    clipboardData.setData(
      'application/athens-representation',
      prStr(copiedBlocks),
    )
    clipboardData.setData('application/athens', prStr({ uids }))

    e.preventDefault()
  }
}

const cut = (js, e) => {
  const uids = subscribe('::select-subs/items')
  if (!empty(uids)) {
    copy(e)
    dispatch('::select-events/delete')
  }
}

// const forceLeave = atom(false)

const preventSave = () => {
  window.addEventListener('beforeunload', (e) => {
    const synced = subscribe(':db/synced'),
      e2eIgnoreSave = localStorage.getItem('E2E_IGNORE_SAVE') === 'true'
    if (!synced && !forceLeave && !e2eIgnoreSave) {
      dispatch(
        ':confirm/js',
        "Athens hasn't finished saving yet. Athens is finished saving when the sync dot is green. " +
          'Try refreshing or quitting again once the sync is complete. ' +
          'Press Cancel to wait, or OK to leave without saving (will cause data loss!).',
        () => {
          reset(forceLeave, true)
          window.close()
        },
      )
      e.preventDefault()
      e.returnValue =
        'Setting e.returnValue to string prevents exit for some browsers.'
      return 'Returning a string also prevents exit on other browsers.'
    }
  })
}

// function init() {
//   document.addEventListener('mousedown', unfocus)
//   window.addEventListener('keydown', multiBlockSelection)
//   window.addEventListener('keydown', keyDown)
//   window.addEventListener('copy', copy)
//   window.addEventListener('cut', cut)
// }
