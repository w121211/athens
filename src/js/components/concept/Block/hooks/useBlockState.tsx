import React from 'react';
import { BlockGraph } from '../../../../main';

export const useBlockState = (blockGraph: BlockGraph): { blockGraph: BlockGraph; setBlockState: React.Dispatch<React.SetStateAction<BlockGraph>>; } => {
  const [blockGraphState, setBlockState] = React.useState(blockGraph);
  return { blockGraph: blockGraphState, setBlockState };
};
