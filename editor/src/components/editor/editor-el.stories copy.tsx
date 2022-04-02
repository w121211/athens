import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { EditorEl } from './editor-el'
import {
  hello,
  helloDraftOnly,
  helloNoteOnly,
  helloNothing,
} from '../../services/mock-data'

const mocks = { hello, helloDraftOnly, helloNoteOnly, helloNothing },
  mockRouteArgs = Object.fromEntries(
    Object.entries(mocks).map(([k, v]) => [k, { symbol: v.title }]),
  )

export default {
  title: 'Editor/EditorEl',
  component: EditorEl,
} as ComponentMeta<typeof EditorEl>

const Template: ComponentStory<typeof EditorEl> = (args) => (
  <EditorEl {...args} />
)

export const GotHello = Template.bind({})
GotHello.args = {
  route: {
    symbol: hello.title,
  },
}
