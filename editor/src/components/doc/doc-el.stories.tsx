import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { setEntities } from '@ngneat/elf-entities'
import { mockLocalData } from '../../services/mock-data'
import { blockRepo } from '../../stores/block.repository'
import { docRepo } from '../../stores/doc.repository'
import { DocEl } from './doc-el'

/**
 * Setup data (before all)
 */
blockRepo.update([setEntities(mockLocalData.blocks)])
docRepo.update([setEntities([mockLocalData.doc])])

export default {
  title: 'Doc/DocEl',
  component: DocEl,
} as ComponentMeta<typeof DocEl>

const Template: ComponentStory<typeof DocEl> = (args) => <DocEl {...args} />

export const Basic = Template.bind({})
Basic.args = {
  doc: mockLocalData.doc,
}
