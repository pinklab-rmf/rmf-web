import { TextField } from '@mui/material';
import React from 'react';
import { ConfirmationDialog, useAsync } from 'react-components';
import { AppControllerContext } from '../app-contexts';

export interface CreateUserDialogProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  createUser?: (username: string) => Promise<void> | void;
}

export function CreateUserDialog({
  open,
  setOpen,
  createUser,
}: CreateUserDialogProps): JSX.Element {
  const safeAsync = useAsync();
  const [creating, setCreating] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false);
  const { showAlert } = React.useContext(AppControllerContext);

  const validateForm = () => {
    let error = false;
    if (!username) {
      setUsernameError(true);
      error = true;
    } else {
      setUsernameError(false);
    }
    return !error;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }
    setCreating(true);
    try {
      createUser && (await safeAsync(createUser(username)));
      setCreating(false);
      setOpen && setOpen(false);
    } catch (e) {
      setCreating(false);
      showAlert('error', `사용자를 만드는데 실패했습니다: ${(e as Error).message}`);
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      title="사용자 생성"
      confirmText="생성"
      cancelText="취소"
      submitting={creating}
      onSubmit={submitForm}
      onClose={() => setOpen && setOpen(false)}
    >
      <TextField
        id="username"
        variant="outlined"
        fullWidth
        autoFocus
        margin="normal"
        label="사용자 이름"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        error={usernameError}
        helperText="필수"
      />
    </ConfirmationDialog>
  );
}
