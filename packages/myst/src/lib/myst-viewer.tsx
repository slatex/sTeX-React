import type { NodeRenderer } from '@myst-theme/providers';
import { mystParse } from 'myst-parser';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import React from 'react';

import { Theme, ThemeProvider } from '@myst-theme/providers';

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
        {text.map((v:any, i:any) => (
          <React.Fragment key={i}>
            {v}
            {i < text.length - 1 && <wbr />}
          </React.Fragment>
        ))}
      </>
    );
  },
};

export function MystViewer({ content }: { content: string }) {
  const astNodes = mystParse(content);
  const MYST_THEME = Theme.light;
  return (
    <ThemeProvider renderers={MY_RENDERERS} theme={MYST_THEME}>
      <MyST ast={astNodes} />
    </ThemeProvider>
  );
}
