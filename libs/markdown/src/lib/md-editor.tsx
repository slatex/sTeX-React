import { TextareaAutosize } from '@mui/material';
import { useState } from 'react';
import styles from './markdown.module.scss';
import { MdViewer } from './md-viewer';

interface MdEditorProps {
  name: string;

  placeholder?: string;

  editingEnabled?: boolean;

  value: string;

  onValueChange: (v: string) => void;
}

const PREVIEW_TRIGGER_SET = /[#$()_+[\]{}|~*<>=]/;

export function MdEditor({
  name,
  placeholder = '',
  editingEnabled = true,
  value,
  onValueChange,
}: MdEditorProps) {
  const [autoPreview, setAutoPreview] = useState(false);
  const [manualAction, setManualAction] = useState<boolean | undefined>(
    undefined
  );

  function checkAutoPreview(content: string) {
    if (autoPreview) return;
    setAutoPreview(PREVIEW_TRIGGER_SET.test(content));
  }

  const showPreview =
    manualAction || (manualAction === undefined && autoPreview);
  return (
    <>
      {editingEnabled && (
        <div>
          <TextareaAutosize
            minRows={2}
            placeholder={placeholder}
            name={name}
            className={styles['textarea']}
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              checkAutoPreview(v);
              onValueChange(v);
            }}
          />
        </div>
      )}
      {autoPreview && (
        <span
          onClick={(_e) => setManualAction(!showPreview)}
          style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }}
        >
          {showPreview ? 'HIDE PREVIEW' : 'SHOW PREVIEW'}
        </span>
      )}
      {(showPreview || !editingEnabled) && (
        <div className={editingEnabled ? styles['edit_preview'] : ''}>
          <MdViewer content={value} />
        </div>
      )}
    </>
  );
}
