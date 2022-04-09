import React, { useState } from 'react'
import {
  ReactEditor,
  RenderElementProps,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import { InlineRateElement } from '../editor/slate-custom-types'
import Modal from '../modal/modal'
import { Transforms } from 'slate'
import { RateFragment } from '../../apollo/query.graphql'
import { InlineItemService } from '../../services/inline.service'
import RateButton from '../rate-form/rate-button'
import CreateRateForm from '../rate-form/create-rate-form'
import { RateChoice } from '@prisma/client'
import UpdateRateForm from '../rate-form/update-rate-form'

const InlineRate = (
  props: RenderElementProps & { element: InlineRateElement },
): JSX.Element => {
  const editor = useSlateStatic()
  const { children, attributes, element } = props
  const [showPopover, setShowPopover] = useState(false)
  // const [shotId, setShotId] = useState(element.id)
  // const [shotData, setShotData] = useState<ShotFragment | undefined>()
  // const { data: targetData } = useNoteQuery({ variables: { id: shotId } })

  const onRateCreated = (rate: RateFragment, targetSymbol: string) => {
    // const editor = useSlateStatic()
    const path = ReactEditor.findPath(editor, element)
    const inlineRate = InlineItemService.toInlineRateString({
      id: rate.id,
      choice: rate.choice,
      symbol: targetSymbol,
      author: element.authorName ?? '',
    })
    Transforms.setNodes<InlineRateElement>(
      editor,
      { id: rate.id },
      { at: path },
    )
    Transforms.insertText(editor, inlineRate, { at: path })
  }

  // useEffect(() => {
  //   // if (showPopover && !pollId) {
  //   //   handleCreatePoll()
  //   // }
  //   // console.log(shotData, shotId)

  //   if (!showPopover && !element.id && shotId && shotData) {
  //     // const queryPollData = async () => {
  //     //   queryPoll({ variables: { id: pollId } })
  //     // }
  //     // queryPollData()
  //     // queryShot({ variables: { id:shotId } })
  //     if (shotData) {
  //       onCreated(shotData)
  //     }
  //   }
  // }, [showPopover, shotData, shotId])
  return (
    <span {...attributes}>
      {/* {!selected && ( */}
      {/* <button
            className={classes.shotBtn}
            contentEditable={false}
            onClick={e => {
              e.stopPropagation()
              setShowPopover(true)
            }}
          >
            {element.params.map((e, i) => {
              return (
                <span
                  className={
                    e.startsWith('@')
                      ? classes.shotAuthor
                      : e.startsWith('$') || e.startsWith('[[')
                      ? classes.shotTarget
                      : e.startsWith('#')
                      ? classes.shotChoice
                      : ''
                  }
                  data-choice={e.startsWith('#') ? e : ''}
                  key={i}
                >
                  {e.startsWith('$') ? '  ' + e + '  ' : e.startsWith('#') ? e.substr(1) : e}
                </span>
              )
            })}
          </button> */}
      <span contentEditable={false}>
        <RateButton
          author={element.params.find((e) => e.startsWith('@'))}
          target={element.params.find((e) => e.startsWith('$'))}
          choice={element.params.find((e) => e.startsWith('#'))}
          onClick={() => setShowPopover(true)}
        />

        {showPopover && (
          <Modal visible={showPopover} onClose={() => setShowPopover(false)}>
            {element.id ? (
              <UpdateRateForm
                rateId={element.id}
                initialInput={{
                  author: element.params.find((e) => e.startsWith('@')) ?? '',
                  target: {
                    value:
                      element.params
                        .find((e) => e.startsWith('$'))
                        ?.substring(1) ?? '',
                    label:
                      element.params
                        .find((e) => e.startsWith('$'))
                        ?.substring(1) ?? '',
                  },
                  choice:
                    (element.params
                      .find((e) => e.startsWith('#'))
                      ?.substring(1) as RateChoice) ?? 'LONG',
                  link: '',
                }}
                onRateCreated={onRateCreated}
              />
            ) : (
              <CreateRateForm
                initialInput={{
                  author: {
                    value: element.params.find((e) => e.startsWith('@')) ?? '',
                    label: element.params.find((e) => e.startsWith('@')) ?? '',
                  },
                  target: {
                    value:
                      element.params
                        .find((e) => e.startsWith('$'))
                        ?.substring(1) ?? '',
                    label:
                      element.params
                        .find((e) => e.startsWith('$'))
                        ?.substring(1) ?? '',
                  },
                  choice:
                    (element.params
                      .find((e) => e.startsWith('#'))
                      ?.substring(1) as RateChoice) ?? 'LONG',
                  link: '',
                }}
                onRateCreated={onRateCreated}
              />
            )}
          </Modal>
        )}
      </span>

      <span className={'text-[0px]'}>{children}</span>
      {/* <span>{children}</span> */}
    </span>
  )
}

export default InlineRate
