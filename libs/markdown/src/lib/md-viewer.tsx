import { useEffect, useReducer, useState } from 'react';
import { MdBlock } from './md-block';
import { parseMarkdown } from './parser/md-parser';
import { AstNode } from './parser/md-utils';
import styles from './markdown.module.scss';

export function MdViewer({ content }: { content: string }) {
  const [parseTree, setParseTree] = useState([] as AstNode[]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const t = parseMarkdown(content);
    setParseTree(t);
    forceUpdate();
  }, [content]);

  return (
    <div style={{ display: 'inherit' }} className={styles['md_parent']}>
      <MdBlock nodes={parseTree} />
    </div>
  );
}
