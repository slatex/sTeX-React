import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { NodeRenderer } from '@myst-theme/providers';
import { mystParse } from 'myst-parser';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import React from 'react';

import { Theme, ThemeProvider } from '@myst-theme/providers';
import { MdLatex } from './latex/md-latex';

export const MY_RENDERERS: Record<string, NodeRenderer> = {
  ...DEFAULT_RENDERERS,
  text({ node }) {
    // Change zero-width space into `<wbr>` which is better for copying
    // These are used in links, and potentially other long words
    if (!node.value?.includes('​')) {
      return <>{node.value}</>;
    }
    const text = node.value.split('​');
    return (
      <>
        {text.map((v: any, i: any) => (
          <React.Fragment key={i}>
            {v}
            {i < text.length - 1 && <wbr />}
          </React.Fragment>
        ))}
      </>
    );
  },
  inlineMath({ node }) {
    return <MdLatex key={node.key} latex={node.value} displayMode={false} />;
  },
  math({ node }) {
    return <MdLatex key={node.key} latex={node.value} displayMode={true} />;
  },
  link({ node }) {
    return (
      <a
        target="_blank"
        href={node.url}
        rel="noreferrer"
        style={{ color: 'blue', display: 'inline-flex', alignItems: 'center' }}
      >
        <MyST ast={node.children} />
        <OpenInNewIcon />
      </a>
    );
  },
};

export function MystViewer({ content }: { content: string }) {
  const astNodes = mystParse(content);
  const MYST_THEME = Theme.light;
  return (
    <ThemeProvider renderers={MY_RENDERERS} theme={MYST_THEME} setTheme={console.log}>
      <MyST ast={astNodes} />
    </ThemeProvider>
  );
}
