import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { createContext, useContext } from 'react';
import { getLocaleObject } from './lang/utils';

export const RenderOptions = createContext({
  renderOptions: {
    allowFolding: false, // Allow section folding
    noFrills: false,
  },
  setRenderOptions: (options: {
    allowFolding: boolean;
    noFrills: boolean;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }) => {},
});

export enum StringOptions {
  FOLD = 'FOLD', // allowFolding
}
export function RendererDisplayOptions({
  noFrills = false,
}: {
  noFrills?: boolean;
}) {
  const t = getLocaleObject(useRouter());
  const { renderOptions, setRenderOptions } = useContext(RenderOptions);
  const optionsList = renderOptions.allowFolding ? [StringOptions.FOLD] : [];

  return (
    <ToggleButtonGroup
      value={optionsList}
      onChange={(_e, o) =>
        setRenderOptions({
          allowFolding: !o.length || o.includes(StringOptions.FOLD),
          noFrills,
        })
      }
    >
      <ToggleButton
        value={StringOptions.FOLD}
        sx={{ p: '0' }}
      >
        <Tooltip
          title={
            renderOptions.allowFolding
              ? t.sectionFoldingOff
              : t.sectionFoldingOn
          }
        >
          <UnfoldLessIcon sx={{ p: '8px' }} />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
