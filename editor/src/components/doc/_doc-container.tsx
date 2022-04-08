import { useObservable } from '@ngneat/react-rxjs'
import React, { memo, useEffect } from 'react'
import { tap } from 'rxjs'
import { blockRepo } from '../../stores/block.repository'
import { fetchNode, nodeEl$, syncTitle } from '../../stores/node-el.repository'
import { BlockContainer } from '../block/block-container'

// Helpers

// // const handleNewFirstChildBlockClick = (parentUid) => {
// //     const newUid = genBlockUid()
// //     const {parentUid, embedId} = uidAndEmbedId(parentUid)
// //     const parentBlock = getBlock([':block/uid', parent-uid])
// //     dispatch(':enter/add-child', {
// //         'block': parentBlock,
// //         newUid,
// //         embedId,
// //     })
// //     dispatch(':editing/uid', newUid)
// // }

// // const handleEnter = (e, uid, _state, children) => {
// //     e.preventDefault()
// //     const nodePage = e.target[closest('.note-page')]
// //     const blockPage = e.target[closest('.block-page')]
// //     const {uid, embedId} = CommonDb.uidAndEmbedId(uid)
// //     const newUid = genBlockUid()
// //     const {start, value}  = destructKeyDown(e)

// //     if (blockPage) {
// //         dispatch(':enter/split-block', {
// //             uid,
// //             value,
// //             ':index': start,
// //             ':new-uid':    newUid,
// //             ':embed-id':   embedId,
// //             ':relation':   ":first"
// //         })
// //     } else if (nodePage) {
// //         if (isEmpty(children)) {
// //             handleMewFirstChildBlockClick(uid)
// //             dispatch(':down', uid)
// //         }
// //     }
// // }

// // const handlePageArrowKey = (e, uid, state) => {
// //     const {keyCode, target} = destructKeyDown(e)
// //     const isStart = isBlockStart()
// //     const isEnd = isBlockEnd()
// //     const caretPosition = getState(':caret-position', state)
// //     const textareaHeight = target.offSetHeight
// //     const {top, height} = caretPosition
// //     const rows = Math.round(textareaHeight / height)
// //     const row = Math.ceil(top / height)
// //     const isTopRow = row === 1
// //     const isBottomRow = row === rows
// //     const isUp = keyCode === KeyCodes.UP
// //     const isDown = keyCode === KeyCodes.DOWN
// //     const isLeft = keyCode === KeyCodes.LEFT
// //     const isRight = keyCode === KeyCodes.RIGHT

// //     if ((isUp && isTopRow) || (isLeft && isStart)) {
// //         e.preventDefault()
// //         dispatch(':up', uid, e)
// //     } else if ((isDown && isBottomRow) || (isRight && isEnd)) {
// //         e.preventDefault()
// //         dispatch(':down', uid, e)
// //     }
// // }

// // const handleKeyDown = (e, uid, state, children) => {
// //     const {keyCode, shift} = destructKeyDown(e)
// //     const caretPosition = getCaretPosition(e.target)
// //     setState(':caret-position', caret-position)

// //     if (arrowKeyDirection(e)) {
// //         handlePageArrowKey(e, uid, state)
// //     }

// //     if (keyCode !== KeyCodes.ENTER && !shift) {
// //         handlerEnter(e, uid, state, children)
// //     }
// // }

// // const autoIncUntitled = () => {
// // }

// // const handleChange = (e, state, setState) => {
// //     const value = e.target.value
// //     state.title.local = value
// // }

// // const handlerBlur = (node, state) => {
// //     const {blockUid as pageUid} = node
// //     const {initial, local} = state.title
// //     const isDoNothing = initial === local

// //     if (!isDoNothing) {
// //         const {existingPageUid} = getPageUid(dsdb, local)
// //         const isMerge = existingPageUid !== null
// //         if (!isMerge) {
// //             dispatch(':page/rename', {
// //                 pageUid,
// //                 oldName: initial,
// //                 newName: local,
// //                 callback: () => {setState(':title/initial', local)}
// //             })
// //             const cancelFn = () => {
// //                 setState(merge(initState))
// //             }
// //             const confirmFn = () => {
// //                 router.navigatePage(local)
// //                 dispatch(':page/merge', {
// //                     fromName: initial,
// //                     toName: local,
// //                     callback: cancelFn
// //                 })
// //             }
// //             setAlert(
// //                 {
// //                     show: true,
// //                     message: `"${local}" already exists, merge pages?`,
// //                     confirmFn,
// //                     cancelFn,
// //                 }
// //             )
// //         }
// //     }

// // }

// // // Components

// // const PlaceholderBlockEl = (parentUid) => {
// //     return (
// //         <div class="block-container">
// //             <div>
// //                 <Anchor />
// //                 <span onClick={() => {
// //                     handleNewFirstChildBlockClick(parentUid)
// //                 }}>Click here to add content...</span>
// //             </div>
// //         </div>
// //     )
// // }

// // const initState = {
// //     menu: { show: false },
// //     title: {
// //         initial: null,
// //         local: null,
// //     },
// //     alert: {
// //         show: null,
// //         message: null,
// //         confirmFn: null,
// //         cancelFn: null,
// //     },
// //     'Linked References': true,
// //     'Unlinked References': false
// // }

// // const menuDropdown = (node, dailyNote) => {
// //     const {uid} = node.block
// //     const {sidebar} = node.page
// //     const {title} = node.title
// //     const ele = withLet(null)
// //     return (
// //         <>
// //             <Button
// //             class={ele && 'is-active'}
// //             onClick={() => {ele.currentTarget = ele}}
// //             style={pageMenuToggleStyle}
// //             >
// //                 <MoreHoriz />
// //             </Button>
// //             <Popover style={merge(useStyle(dropdownStyle), {})}>
// //                 <div>
// //                     <>
// //                     {sidebar && (
// //                         <Button>
// //                             <BookmarkBorder />
// //                             <span>Remove Shortcut</span>
// //                         </Button>
// //                         <Button>
// //                             <Bookmark />
// //                             <span>Add Shortcut</span>
// //                         </Button>
// //                     )}
// //                     <Button>
// //                         <BubbleChart />
// //                         <span>Show Local Graph</span>
// //                     </Button>
// //                     </>
// //                     <hr />
// //                     <Button onClick={() => {
// //                         // if page being deleted is in right sidebar, remove from right sidebar
// //                         if (contains(subscribe(':right-sidebar/items'), uid)) {
// //                             dispatch(':right-sidebar/close-item', uid)
// //                         }
// //                         // if page being deleted is open, navigate to all pages
// //                         if (
// //                             (subscribe(':current-route/page-title') === title) ||
// //                             (subscribe(':current-route/uid') === uid)
// //                         ) {
// //                             navigate(':pages')
// //                         }
// //                     }}>
// //                         <Delete />
// //                         <span>Delete Page</span>
// //                         </Button>
// //                 </div>
// //             </Popover>
// //         </>
// //     )
// // }

// const refComp = (block) => {
//     const state = atom({
//         block,
//         embedId: randomUUID(),
//         parents: block.parents
//     })
//     const linkedRefData = {
//         linkedRef: true,
//         initialOpen: true,
//         linkedRefUid: block.uid,
//         parentUids: block.parents.map(e => e.uid)
//     }
//     return () => {
//         const {block, parents, embedId} = state
//         const block = getReactiveBlockDocument(block.db.id)
//         return (
//             <>
//                 {breadcrumbsList}
//                 {parents.map(e => {
//                     const {title, string, uid} = e
//                     const breadcrumb = breadcrumb({
//                         key: `breadcrumb-${uid}`,
//                         onClick: () => {
//                             const newB = getBlock([':block/uid', uid])
//                             const newP = dropLast(parents)
//                             setState({
//                                 block: newB,
//                                 parents: newP
//                             })
//                         }
//                     })
//                     return (
//                         <>
//                             {breadcrumb}
//                             {parseAndRender(title || string, uid)}
//                         </>
//                     )
//                 })}
//             </>
//         )
//     }
// }

export const NotePage = ({ ident }: { ident: string }): JSX.Element => {
  // const [state, setState] = useState(initState)
  // const unlinkedRefs = atom([])
  // const blockUid = atom(null)
  // const [blockUid, setBlockUid] = useState<string | null>(null)
  const [nodeEl] = useObservable(nodeEl$)

  useEffect(() => {
    console.log('fetchNode(ident)')
    fetchNode(ident)
  }, [])

  // return node => {
  // if (blockUid !== node.block.uid) {
  //   // setState(initState)
  //   // unlinkedRefs.set([])
  //   setBlockUid(node.block.uid)
  // }
  // const { children, uid } = nodeEl.node?.block
  // const { title } = nodeEl.node
  // const { message, confirmFn, cancelFn, show: alertShow } = state.alert

  // syncTitle('hello sync title')

  return (
    <div className="note-page" data-uid={'uid'}>
      {/* {alertShow && <Dialog isOpen={true} title={message} onConfirm={confirmFn} onDismiss={cancelFn} />} */}

      <header />

      {nodeEl.title.local}

      {/* {menuDropdown(ndoe, dailyNote)} */}

      {/* <h1
        data-uid={uid}
        onClick={e => {
          e.preventDefault()
          dispatch(':editing/uid', uid)
        }}
      >
        <textarea
          value={state.title.local}
          id={`"editable-uid-${uid}`}
          class={isEditing && 'is-editing'}
          onBlur={() => {
            if (state.title.local === undefined) {
              title.local = autoIncUntitled()
            }
          }}
          onKeyDown={e => {
            handleKeyDown(e, uid, state, children)
          }}
          onChange={e => {
            handleChange(e, state)
          }}
        />
      </h1> */}

      {nodeEl.node?.block.uid ? (
        <NoteBlockChildren uid={nodeEl.node.block.uid} />
      ) : (
        // <PlaceholderBlockEl uid={uid} />
        <span>PlaceholderBlockEl</span>
      )}
    </div>
  )
  // }
}

// export const NodePage = ({ ident }: { ident: string }) => {
//   const [node] = useObservable(nodeEl$)
//   useEffect(() => {
//     // fetchTodos().subscribe()
//     // fetchNode().subscribe(ident)
//     console.log('NodePageEl::enters')
//   }, [])
//   return NodePageEl
// }

// export const nodePage = (ident: string): JSX.Element => {
//   const [node] = useObservable(nodeEl$)

//   fetchNode(ident).subscribe()

//   return NodePageEl(node)
// }
