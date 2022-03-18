/**
;; Using DOM, focus the target block.
;; There can actually be multiple elements with the same #editable-uid-UID HTML id
;; The same unique datascript block can be rendered multiple times: node-page, right sidebar, linked/unlinked references
;; In this case, find the all the potential HTML blocks with that uid. The one that shares the same closest ancestor as the
;; activeElement (where the text caret is before the new focus happens), is the container of the block to focus on.

;; If an index is passed, set cursor to that index.

;; TODO: some issues
;; - auto-focus on textarea
;; - searching for common-ancestor on inside of setTimeout vs outside
;;   - element sometimes hasn't been created yet (enter), sometimes has been just destroyed (backspace)
;; - uid sometimes nil
*/

// import { uidAndEmbedId } from './db'

/**
;; NOTE: Using 99999999999 is a hack, if the previous block has less character than mentioned then the default
;;       caret position will be last position. Otherwise, we would have to calculate the no. of characters in the
;;       block we are moving to, this calculation would be done on client side and, I am not sure if the calculation
;;       would be correct because between calculation on client side and block data on server can change.]
 */
export function editingFocus(uid: string | null, index?: number | 'end') {
  const editingIndex = index === 'end' ? 999999999 : index

  if (uid === null) {
    if (typeof document !== 'undefined') {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }
  } else {
    // const _uid = uid
    setTimeout(() => {
      // const [uid, embedId] = uidAndEmbedId(_uid),
      const htmlId = 'editable-uid-' + uid,
        // el = document.querySelector(embedId ? 'text')
        el = document.querySelector<HTMLTextAreaElement>('#' + htmlId)

      if (el) {
        el.focus()
        if (editingIndex) {
          //  setCursorPosition(el, editingIndex)
          // @see https://github.com/google/closure-library/blob/master/closure/goog/dom/selection.js#L226
          el.setSelectionRange(editingIndex, editingIndex)
        }
      }
    }, 100)
  }
}

/**
;; todo(abhinav)
;; think of this + up/down + editing/focus for common up down press
;; and cursor goes to apt position rather than last visited point in the block(current)
;; inspirations - intelli-j's up/down
 */
export function setCursorPosition(uid: string, start: number, end: number) {
  setTimeout(() => {
    const target = document.querySelector<HTMLTextAreaElement>('#editable-uid-' + uid)
    if (target) {
      target.focus()
      target.selectionStart = start
      target.selectionEnd = end
    }
  }, 100)
}

// Routing

export function navigate() {
  // TODO
}
