import { getUserName } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { EditView } from './EditView';
import TextsmsIcon from '@mui/icons-material/Textsms';

import styles from './comments.module.scss';
import { Box } from '@mui/material';
import { SelectedInfo } from './selected-info';

interface CommentReplyProps {
  archive: string;
  filepath: string;
  parentId?: number;
  placeholder?: string;
  selectedText?: string;
  selectedElement?: any;
  hidden?: boolean;
  onCancel?: () => void;
  onUpdate: () => void;
}

export function CommentReply({
  archive,
  filepath,
  parentId = 0,
  placeholder = '',
  selectedText = undefined,
  selectedElement = undefined,
  hidden = false,
  onCancel,
  onUpdate,
}: CommentReplyProps) {
  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUserName().then(setName);
  }, []);

  return (
    <Box
      hidden={hidden}
      display={hidden ? 'none' : 'flex'}
      alignItems="stretch"
    >
      <TextsmsIcon fontSize="large" color="secondary" />
      <div className={styles['stretchy_div']}>
        <span className={styles['user_link']}>{name}</span>
        <SelectedInfo text={selectedText} />
        <EditView
          parentId={parentId}
          archive={archive}
          filepath={filepath}
          selectedText={selectedText}
          placeholder={placeholder}
          onCancel={onCancel}
          onUpdate={onUpdate}
        />
      </div>
    </Box>
  );
}
