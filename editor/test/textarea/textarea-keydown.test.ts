import { textareaKeyDown } from '../../src/textarea-keydown'

test('handleArrowKey()', () => {
  const event = new KeyboardEvent('keydown', {
    keyCode,
    shiftKey,
    altKey,
    ctrlKey,
  })
  // jest
  //   .spyOn(keyboardEvent, 'getModifierState')
  //   .mockImplementation((modifier) => {
  //     switch (modifier) {
  //       case 'Alt':
  //         return altKey
  //       case 'Control':
  //         return ctrlKey
  //       case 'Shift':
  //         return shiftKey
  //     }
  //   })

  textareaKeyDown(
    event,
    uid: string,
    editing: boolean,
    state: BlockElState,
    setState: BlockElStateSetFn,
  )
})
