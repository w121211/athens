import { modifyBlocks } from '../utils/modifyBlocks';
import { toggleBlockProperty } from '../utils/toggleBlockProperty';
import { BlockGraph, UID } from '../../../../main';

export const useToggle = (blockGraph: BlockGraph, setBlockState) => {
  const graph = modifyBlocks({
    blockGraph: blockGraph,
    ApplyProps: (block) => ({
      isOpen: block.isOpen,
      handlePressToggle: (uid: UID) => toggleBlockProperty(uid, 'isOpen', setBlockState),
    }),
  });

  return { blockGraph: graph };
};
