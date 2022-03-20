import { DragEvent } from 'react'
import { KeyboardEvent } from 'react'

export function destructKeyDown(e: KeyboardEvent) {
  const key = e.code, // key = e.keyCode,
    ctrl = e.ctrlKey,
    meta = e.metaKey,
    shift = e.shiftKey,
    alt = e.altKey
  return { keyCode: key, ctrl, meta, shift, alt }
}

// OS

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

// DOM

export function getDatasetUid(el: HTMLElement): string | null {
  const block = el && el.closest('.block-container'),
    uid = block && block.getAttribute('data-uid')
  return uid
}

/**
 * "Finds offset between mouse event and container. If container is not passed, use target as container."
 */
export function mouseOffset(event: DragEvent, container: Element) {
  const rect = container.getBoundingClientRect(),
    offsetX = event.pageX - rect.left,
    offsetY = event.pageY - rect.top
  return { x: offsetX, y: offsetY }
}

export function verticalCenter(el: Element) {
  const rect = el.getBoundingClientRect(),
    y = (rect.bottom - rect.top) / 2
  return y
}
