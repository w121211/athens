import React, { useState } from 'react'
import { setEntities } from '@ngneat/elf-entities'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { blockRepo } from '../../stores/block.repository'
import { BlockEl } from './block-el'
import { mockLocalData } from '../../services/mock-data'

/**
 * Setup data
 */
blockRepo.update([setEntities(mockLocalData.blocks)])

export default {
  title: 'Block/BlockEl',
  component: BlockEl,
} as ComponentMeta<typeof BlockEl>

const Template: ComponentStory<typeof BlockEl> = (args) => <BlockEl {...args} />

export const Basic = Template.bind({})
Basic.args = {
  uid: mockLocalData.blocks[0].uid,
  isEditable: true,
}

export const WithDocContainerMock = () => (
  <div className="doc-container">
    <BlockEl uid="b1" isEditable />
  </div>
)

// export const Editing = Template.bind({})
// Editing.args = {
//   label: 'Button',
// }

// export const Selected = Template.bind({})
// Selected.args = {
//   size: 'large',
//   label: 'Button',
// }
