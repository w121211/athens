import { MouseEvent } from 'react'
import { KeyboardEvent } from 'react'
import { rfdbStore } from './stores/rfdb.repository'
import { destructKeyDown, shortcutKey } from './utils'

function multiBlockSelection(event: globalThis.KeyboardEvent) {
  const selectedItems = subscribe('select-subs/items')
  if (!empty(selectedItems)) {
    const shift = event.shiftKey,
      keyCode = event.keyCode,
      enter = keyCode === 'KeyCodes.ENTER',
      bksp = keyCode === 'KeyCodes.BACKSPACE',
      up = keyCode === 'KeyCodes.UP',
      down = keyCode === 'KeyCodes.DOWN',
      tab = keyCode === 'KeyCodes.TAB',
      deleteKey = keyCode === 'KeyCodes.DELETE'

    if (enter) {
      dispatch('editing/uid', selectedItems[0])
      dispatch('select-events/clear')
    } else if (bksp || deleteKey) {
      dispatch('select-events/delete')
      dispatch('select-events/clear')
    } else if (tab) {
      e.preventDefault()
      if (shift) {
        dispatch('unindent/multi', { uids: selectedItems })
        dispatch('indent/multi', { uids: selectedItems })
      }
    } else if (shift && up) {
      dispatch('selected/up', selectedItems)
    } else if (shift && down) {
      dispatch('selected/down', selectedItems)
    } else if (up || down) {
      e.preventDefault()
      dispatch('select-events/clear', selectedItems)
      if (up) {
        dispatch('up', selectedItems[0], e)
        dispatch('down', selectedItems[selectedItems.length - 1], e)
      }
    }
  }
}

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

// Hotkeys

function keyDown(event: globalThis.KeyboardEvent) {
  const dKeyDown = destructKeyDown(event as unknown as KeyboardEvent),
    { keyCode, ctrl, meta, shift, alt } = dKeyDown
  // editingUid = subscribe('editing/uid')

  // if (navigateKey(destructKeys)) {
  //   switch (keyCode) {
  //     case 'KeyCodes.LEFT':
  //       if (editingUid === null) {
  //         window.history.back()
  //       }
  //       break
  //     case 'KeyCodes.RIGHT':
  //       if (editingUid === null) {
  //         window.history.forward()
  //       }
  //       break
  //   }
  // } else
  if (shortcutKey(meta, ctrl)) {
    switch (keyCode) {
      case 'KeyCodes.S':
        dispatch.save()
        break
      case 'KeyCodes.EQUALS':
        // zoom in
        break
      case 'KeyCodes.DASH':
        // zoom out
        break
      case 'KeyCodes.ZERO':
        // zoom reset
        break
      case 'KeyCodes.K':
        // toggle
        break
      case 'KeyCodes.G':
        break
      case 'KeyCodes.Z':
        break
      case 'KeyCodes.BACKSLASH':
        break
      case 'KeyCodes.COMMA':
        break
      case 'KeyCodes.T':
        break
    }
  } else if (alt) {
    switch (keyCode) {
      case 'KeyCodes.D':
        break
      case 'KeyCodes.G':
        break
      case 'KeyCodes.A':
        break
      case 'KeyCodes.T':
        break
    }
  }
}

// Clipboard

const unformatDoubleBrackets = () => {}

const blockRefsToPlainText = (s) => {}

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

const forceLeave = atom(false)

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

function init() {
  document.addEventListener('mousedown', unfocus)
  window.addEventListener('keydown', multiBlockSelection)
  window.addEventListener('keydown', keyDown)
  window.addEventListener('copy', copy)
  window.addEventListener('cut', cut)
}
