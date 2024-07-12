import { mystParse } from 'myst-parser';
import { useEffect, useState } from 'react';

import type { GenericNode, GenericParent } from 'myst-common';

export function mystParser(content: string) {
  const [astNodes, setAstNodes] = useState<GenericNode | undefined>();
  useEffect(() => {
    const mdast: GenericParent = mystParse(content);
    setAstNodes(mdast);
  }, [content]);
  return astNodes;
}
