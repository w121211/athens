import { useObservable } from '@ngneat/react-rxjs'
import React from 'react'
import { memo } from 'react'
import { MouseEvent } from 'react'
import { useEffect } from 'react'
import { events } from '../../events'
import { rfdbRepo } from '../../stores/rfdb.repository'
import { textareaKeyDown } from '../../textarea-keydown'

// const findSelectedItems = (e, sourceUid, targetUid) => {
//   const target = e.target,
//     page = target.closest('.node-page') || target.closes('.block-page'),
//     blocks = page.querySelectorAll('.block-container'),
//     uids = blocks.map(e => getDatasetUid(e)),
//     uidsChildrenUids = zipmap(uids, blocks.map(getDatasetChildrenUids)),
//     indexedUids = uids.mapIndexed(vector),
//     startIndex = indexedUids.filter((_idx, uid) => sourceUid === uid),
//     endIndex = indexedUids.filter((_idx, uid) => targetUid === uid),
//     selectedUids = subscribe('select-subs/items'),
//     candidateUids = indexedUids.filter(
//       (idx, _uid) => Math.min(startIndex, endIndex) <= idx <= Math.max(startIndex, endIndex),
//     ),
//     descendantUids = loop(),
//     toRemoveUids = set.intersect(selectedUids, descendantUids),
//     selectionNewUids = set.difference(candidateUids, descendantUids),
//     newSelectedUids = set.union(set.difference(selectedUids, toRemoveUids), selectionNewUids),
//     selectionOrder = indexedUids.filter((_k, v) => newSelectedUids.contains(v)).mapv('second')

//   if (startIndex && endIndex) {
//     dispatchEvent('select-events/set-items', selectionOrder)
//   }
// }

// const textareaPaste = (e, _uid, state) => {
//   const data = e.clipboardData,
//     textData = data.getData('text/plain'),
//     internalPresentation = data.getData('application/athens-representation'),
//     // internal representation
//     internal = seq(internalPresentation),
//     newUids = newUidsMap(internalPresentation),
//     reprWithNewUids = updateUids(internalPresentation, newUids),
//     // images in clipboard
//     items = arraySeq(e.clipboardData.items),
//     { head, tail } = destructTarget(e.target),
//     imgRegex = /#"(?i)^image\/(p?jpeg|gif|png)$"/,
//     callback = () => {},
//     // external to internal representation
//     textToInter = textData !== '' && textToInternalPresentation(textData),
//     lineBreaks = reFind(/\r?\n/, textData),
//     noShift = state.lastKeydown !== 'shift'

//   if (internal) {
//     e.preventDefaul()
//     dispatchEvent('paste-internal', uid, state.string.local, reprWithNewUids)
//   } else if (seq(filter())) {
//     // For images
//   } else if (lineBreaks && noShift) {
//     e.preventDefaul()
//     dispatchEvent('paste-internal', uid, state.string.local, textToInter)
//   } else if (noShift) {
//     e.preventDefaul()
//     dispatchEvent('paste-verbatim', uid, textData)
//   }
// }

function textareaChange(
  event: React.ChangeEvent<HTMLTextAreaElement>,
  _uid: string,
  state: BlockElState,
  setState: BlockElStateSetFn,
) {
  setState({
    ...state,
    str: { ...state.str, local: event.target.value },
  })
  // if (state.string.idleFn) {
  //   state.string.idleFn()
  // }
}

function textareaClick(event: MouseEvent, targetUid: string): void {
  // const [targetUid] = uidAndEmbedId(targetUid),
  // const sourceUid = subscribe('editing/uid'),
  //   shift = e.shiftKey
  // if (shift && sourceUid && targetUid && sourceUid !== targetUid) {
  //   findSelectedItems(e, sourceUid, targetUid)
  //   dispatchEvent('select-events/clear')
  // }
  const shift = event.shiftKey
  rfdbRepo.editingUid$.subscribe(sourceUid => {
    if (shift && sourceUid && targetUid && sourceUid !== targetUid) {
      // findSelectedItems(e, sourceUid, targetUid)
      // dispatchEvent('select-events/clear')
    }
  })
}

function globalMouseup() {
  document.removeEventListener('mouseup', globalMouseup)
  rfdbRepo.setProps({ mouseDown: false })
}

function textareaMouseDown(e: MouseEvent) {
  e.stopPropagation()
  if (!e.shiftKey) {
    events.editingTarget(e.target as HTMLTextAreaElement)

    const { mouseDown } = rfdbRepo.getValue()
    if (!mouseDown) {
      rfdbRepo.setProps({ mouseDown: true })
      document.addEventListener('mouseup', globalMouseup)
    }
  }
}

function textareaMouseEnter() {
  const { editing, mouseDown } = rfdbRepo.getValue(),
    sourceUid = editing?.uid

  if (mouseDown) {
    // dispatchEvent('select-events/clear')
    // findSelectedItems(e, sourceUid, targetUid)
    rfdbRepo.setProps({ selection: { items: [] } })
  }
}

// View

export const BlockContent = ({
  block,
  state,
  setState,
}: {
  block: Block
  state: BlockElState
  setState: React.Dispatch<React.SetStateAction<BlockElState>>
}) => {
  // const { uid, originalUid, header } = block.block,
  // selectedItems = subscribe('select-subs/items')

  const { uid } = block,
    [editing] = useObservable(rfdbRepo.getBlockIsEditing$(uid))

  useEffect(() => {
    // console.debug('BlockContentEl::enter ' + uid)
  })

  return (
    <div className="block-content">
      {(state.showEditableDom || editing) && (
        <textarea
          value={state.str.local ?? ''}
          // className={['textarea', empty(selectedItems) && editing ? 'is-editing' : undefined].join('')}
          id={`editable-uid-${uid}`}
          onChange={e => {
            textareaChange(e, uid, state, setState)
          }}
          // onPaste={e => {
          //   textareaPaste(e, uid, state)
          // }}
          onKeyDown={e => {
            textareaKeyDown(e, uid, editing, state, setState)
          }}
          // onBlur={state.string.saveFn}
          onClick={e => {
            textareaClick(e, uid)
          }}
          onMouseEnter={e => {
            textareaMouseEnter()
          }}
          onMouseDown={e => {
            textareaMouseDown(e)
          }}
        />
      )}

      {/* {parseAndRender(state.string.local, originalUid || uid)} */}
      <span>
        {state.str.local}xxxxxxxxxxxx{uid}
      </span>
    </div>
  )
}

export const MemoBlockContent = memo(BlockContent)
