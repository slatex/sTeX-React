import { Box, TextareaAutosize } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { MystViewer } from './myst-viewer';
import styles from './myst.module.scss';

interface MystEditorProps {
  name: string;

  minRows?: number;

  placeholder?: string;

  editingEnabled?: boolean;

  value: string;

  defaultPreview?: boolean;

  onValueChange: (v: string) => void;

  editorProps?: any;
}

const PREVIEW_TRIGGER_SET = /[#$()_+[\]{}|~*<>=]/;

export function MystEditor({
  name,
  minRows = 2,
  placeholder = '',
  editingEnabled = true,
  value,
  onValueChange,
  defaultPreview = false,
  editorProps,
}: MystEditorProps) {
  const t = getLocaleObject(useRouter());
  const [autoPreview, setAutoPreview] = useState(defaultPreview);
  const [manualAction, setManualAction] = useState<boolean | undefined>(undefined);

  function checkAutoPreview(content: string) {
    if (autoPreview) return;
    setAutoPreview(PREVIEW_TRIGGER_SET.test(content));
  }

  const showPreview = manualAction || (manualAction === undefined && autoPreview);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      {editingEnabled && (
        <Box sx={{ maxWidth: '800px', flex: '1 1 400px' }}>
          <TextareaAutosize
            minRows={minRows}
            placeholder={placeholder}
            name={name}
            className={styles['textarea']}
            value={value}
            style={editorProps ?? {}}
            onChange={(e) => {
              const v = e.target.value;
              checkAutoPreview(v);
              onValueChange(v);
            }}
          />
        </Box>
      )}
      <Box sx={{ maxWidth: '800px', flex: '1 1 400px' }}>
        {autoPreview && (
          <span
            onClick={(_e) => setManualAction(!showPreview)}
            style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }}
          >
            {showPreview ? t.hidePreview : t.showPreview}
          </span>
        )}
        {(showPreview || !editingEnabled) && (
          <Box className={editingEnabled ? styles['edit_preview'] : ''}>
            <MystViewer content={value} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
