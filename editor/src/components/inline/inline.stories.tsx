import React, { useState } from 'react'
import { setEntities } from '@ngneat/elf-entities'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { blockRepo } from '../../stores/block.repository'
import { mockLocalDoc } from '../../services/mock-data'
import { RenderEl } from './inline-parse-renderer'

/**
 * Setup data
 */
blockRepo.update([setEntities(mockLocalDoc.blocks)])

export default {
  title: 'Component/InlineEl',
  component: RenderEl,
} as ComponentMeta<typeof RenderEl>

const Template: ComponentStory<typeof RenderEl> = (args) => (
  <RenderEl {...args} />
)

export const Basic = Template.bind({})
Basic.args = {
  inlines: [
    { type: 'discuss', str: 'hello' },
    { type: 'text', str: ' ' },
    { type: 'topic', str: 'world' },
  ],
}

// export const WithDocContainerMock = () => (
//   <div className="doc-container">
//     <BlockEl uid="b1" isEditable />
//   </div>
// )

// export const Editing = Template.bind({})
// Editing.args = {
//   label: 'Button',
// }

// export const Selected = Template.bind({})
// Selected.args = {
//   size: 'large',
//   label: 'Button',
// }
