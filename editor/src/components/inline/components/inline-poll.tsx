import React, { useState, useEffect } from 'react'
import {
  ReactEditor,
  RenderElementProps,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import { InlinePollElement } from '../editor/slate-custom-types'
import { Transforms } from 'slate'
import { PollFragment, usePollLazyQuery } from '../../apollo/query.graphql'
import PollGroup from '../emoji-up-down/poll-group'
import { InlineItemService } from '../../services/inline.service'

const InlinePoll = (
  props: RenderElementProps & { element: InlinePollElement },
): JSX.Element => {
  const { attributes, children, element } = props
  const selected = useSelected()
  // const context = useContext(Context)
  const editor = useSlateStatic()
  // const { selection } = editor
  const path = ReactEditor.findPath(editor, element)
  const [showPopover, setShowPopover] = useState(false)
  const [clickedIdx, setClickedIdx] = useState<number | undefined>()
  const [pollId, setPollId] = useState(element.id)
  // const [pollData, setPollData] = useState<Poll | undefined>()
  // console.log(clickedIdx)
  function onCreated(poll: PollFragment) {
    // const editor = useSlateStatic()
    // const path = ReactEditor.findPath(editor, element)
    const inlinePoll = InlineItemService.toInlinePoll({
      id: poll.id,
      choices: poll.choices,
    })
    Transforms.setNodes<InlinePollElement>(editor, inlinePoll, { at: path })
    Transforms.insertText(editor, inlinePoll.str, { at: path })
  }

  const [queryPoll, { data: pollData, error, loading }] = usePollLazyQuery()

  // const parent = Node.parent(editor, path) as LcElement

  const handleCreatePoll = () => {
    // if (parent.id) {
    //   createPoll({ variables: { bulletId: parent.id, data: { choices: element.choices } } })
    // }
  }

  useEffect(() => {
    // if (showPopover && !pollId) {
    //   handleCreatePoll()
    // }
    if (!showPopover && !element.id && pollId) {
      // const queryPollData = async () => {
      //   queryPoll({ variables: { id: pollId } })
      // }
      // queryPollData()
      queryPoll({ variables: { id: pollId } })
      if (pollData?.poll) {
        onCreated(pollData.poll)
      }
    }
  }, [showPopover, pollData, pollId])

  // useEffect(() => {
  //   // console.log(path, selection)
  //   if (selected && selection) {
  //     const isEnd = Point.equals(selection.focus, { path: [...path, 0], offset: element.str.length })
  //     if (isEnd) {
  //       Transforms.setSelection(editor, {
  //         anchor: { path: Path.next(path), offset: 0 },
  //         focus: { path: Path.next(path), offset: 0 },
  //       })
  //     }
  //   }
  // }, [selection, selected])

  const handleHideBoard = () => {
    setClickedIdx(undefined)
    setShowPopover(false)
  }
  // const queryPoll = usePollQuery({ variables: { id: element.id.toString() } })

  // if (readonly) {
  //   if (element.type === 'poll') {
  //     return (
  //       <span {...attributes}>
  //         <MyHashtagGroup choices={element.choices} pollId={element.id?.toString() ?? ''} />
  //       </span>
  //     )
  //   }
  //   return (
  //     <button {...attributes} className="inline mR">
  //       {children}
  //     </button>
  //   )
  // }
  // if (element.type === 'poll') {
  return (
    <button className="btn-reset-style" {...attributes}>
      {/* <span style={selected ? undefined : { display: 'none' }}>{children}</span> */}

      {!selected && (
        <span contentEditable={false}>
          <PollGroup
            // bulletId={parent.id}
            choices={element.choices}
            pollId={element.id?.toString()}
            handleShowPopover={(b) => {
              setShowPopover(b)
            }}
            onCreatePoll={handleCreatePoll}
            handleClickedIdx={(i) => {
              setClickedIdx(i)
            }}
            handlePollId={(id: string) => {
              setPollId(id)
            }}
            handlePollData={(data: PollFragment) => {
              // setPollData(data)
            }}
            inline
          />
          {/* parent.id = bullet id */}
          {/* {showPopover && parent.id && (
            <Popover visible={showPopover} hideBoard={handleHideBoard}>
              {pollId ? (
                <PollPage pollId={pollId} clickedChoiceIdx={clickedIdx} />
              ) : (
                <CreatePollForm
                  choices={element.choices}
                  handlePollId={(pollId: string) => {
                    setPollId(pollId)
                  }}
                />
              )}
            </Popover>
          )} */}
        </span>
      )}
      {/* <span>{children}</span> */}
      <span style={selected ? undefined : { fontSize: '0px' }}>{children}</span>
    </button>
  )
}

export default InlinePoll
