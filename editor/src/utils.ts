import { KeyboardEvent } from 'react'

export function destructKeyDown(e: KeyboardEvent) {
  const key = e.code, // key = e.keyCode,
    ctrl = e.ctrlKey,
    meta = e.metaKey,
    shift = e.shiftKey,
    alt = e.altKey
  return { keyCode: key, ctrl, meta, shift, alt }
}

// --- OS ---

function getOS() {
  if (typeof window !== 'undefined') {
    const os = window.navigator.appVersion
    if (os.includes('Windows')) return 'Windows'
    if (os.includes('Linux')) return 'Linux'
    if (os.includes('Mac')) return 'Mac'
  }
  return 'Others'
}

export function shortcutKey(meta: boolean, ctrl: boolean) {
  const os = getOS()
  if (os === 'Mac' && meta) return true
  if (os === 'Windows' && ctrl) return true
  if (os === 'Linux' && ctrl) return true
  if (os === 'Others' && ctrl) return true
  return false
}

export function genBlockUid(): string {
  // return cuid()
  return '' + Math.floor(Math.random() * 1000)
}
