import { getUserName } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { EditView } from './EditView';
import TextsmsIcon from '@mui/icons-material/Textsms';

import styles from './comments.module.scss';

interface CommentReplyProps {
  archive: string;
  filepath: string;
  parentId?: number;
  placeholder?: string;
  hidden?: boolean;
  onCancel?: () => void;
}

export function CommentReply({
  archive,
  filepath,
  parentId = 0,
  placeholder = '',
  hidden = false,
  onCancel = undefined,
}: CommentReplyProps) {
  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUserName().then(setName);
  }, []);

  return (
    <div
      hidden={hidden}
      style={{ display: hidden ? 'none' : 'flex', alignItems: 'stretch' }}
    >
      <TextsmsIcon fontSize="large" color="secondary" />
      <div className={styles['stretchy_div']}>
        <span className={styles['user_link']}>{name}</span>
        <EditView
          parentId={parentId}
          archive={archive}
          filepath={filepath}
          placeholder={placeholder}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
