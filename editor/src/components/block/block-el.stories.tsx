import React, { useState } from 'react'
import { setEntities } from '@ngneat/elf-entities'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { blockRepo } from '../../stores/block.repository'
import { blocks } from '../../../test/helpers'
import { BlockEl } from './block-el'

/**
 * Setup data
 */
blockRepo.update([setEntities(blocks)])

export default {
  title: 'Block/BlockEl',
  component: BlockEl,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
} as ComponentMeta<typeof BlockEl>

const Template: ComponentStory<typeof BlockEl> = (args) => <BlockEl {...args} />

export const Basic = Template.bind({})
Basic.args = {
  uid: 'b1',
}

// export const Editing = Template.bind({})
// Editing.args = {
//   label: 'Button',
// }

// export const Selected = Template.bind({})
// Selected.args = {
//   size: 'large',
//   label: 'Button',
// }
