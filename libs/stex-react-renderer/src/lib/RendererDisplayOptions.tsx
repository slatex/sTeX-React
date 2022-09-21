import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { createContext, useContext } from 'react';

export const RenderOptions = createContext({
  renderOptions: {
    expandOnScroll: true, // Auto expand sections on scroll
    allowFolding: true, // Allow section folding
  },
  setRenderOptions: (options: {
    expandOnScroll: boolean;
    allowFolding: boolean;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }) => {},
});

export enum StringOptions {
  AUTO = 'AUTO', // expandOnScroll
  FOLD = 'FOLD', // allowFolding
}
export function RendererDisplayOptions() {
  const { renderOptions, setRenderOptions } = useContext(RenderOptions);
  const optionsList = [
    renderOptions.expandOnScroll ? StringOptions.AUTO : undefined,
    renderOptions.allowFolding ? StringOptions.FOLD : undefined,
  ].filter((o) => !!o);

  return (
    <ToggleButtonGroup
      value={optionsList}
      onChange={(_e, o) =>
        setRenderOptions({
          expandOnScroll: o.includes(StringOptions.AUTO),
          allowFolding: !o.length || o.includes(StringOptions.FOLD),
        })
      }
    >
      <ToggleButton
        value={StringOptions.FOLD}
        disabled={!renderOptions.expandOnScroll}
        sx={{ p: '0' }}
      >
        <Tooltip
          title={
            renderOptions.allowFolding
              ? 'Turn Off Section Folding'
              : 'Turn On Section Folding '
          }
        >
          <UnfoldLessIcon sx={{ p: '8px' }} />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value={StringOptions.AUTO} sx={{ p: '0' }}>
        <Tooltip
          title={
            renderOptions.expandOnScroll
              ? 'Turn Off Expand on Scroll'
              : 'Turn On Expand on Scroll'
          }
        >
          <AutoAwesomeIcon sx={{ p: '8px' }} />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
