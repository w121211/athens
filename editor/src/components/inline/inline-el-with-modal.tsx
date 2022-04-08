import { useState } from 'react'
import { InlineItem } from '../../interfaces'

const InlineElWithModal = ({
  inline: { type, str },
  onModalClose: () => void
}: {
  inline: InlineItem
}) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <span>
      <Modal></Modal>
    </span>
  )
}

export default InlineElWithModal

const el = (
 <InlineElWithModal>
   <InlineDiscuss />
 </InlineElWithModal> 
)
