import React from 'react'
import { RenderElementProps } from 'slate-react'
import { InlineCommentElement } from '../editor/slate-custom-types'

const InlineComment = ({
  children,
  attributes,
  element,
}: RenderElementProps & { element: InlineCommentElement }): JSX.Element => {
  return (
    <span {...attributes} className="align-top">
      <span className="inline-block max-w-[10rem] align-top truncate text-gray-400">
        {children}
      </span>
    </span>
  )
}

export default InlineComment
