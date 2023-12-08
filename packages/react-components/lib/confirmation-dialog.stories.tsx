import { Button, Paper, Typography } from '@mui/material';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import { ConfirmationDialog, ConfirmationDialogProps } from './confirmation-dialog';

export default {
  title: 'Dialog/Confirmation Dialog',
  component: ConfirmationDialog,
  argTypes: {
    onClose: { actions: 'close' },
  },
} as Meta;

export const Default: Story<ConfirmationDialogProps> = (args) => {
  return (
    <ConfirmationDialog
      {...args}
      open={true}
      toolbar={
        <Button variant="contained" color="primary">
          행동
        </Button>
      }
    >
      <Paper variant="outlined" style={{ padding: 200 }}>
        <Typography>내용</Typography>
      </Paper>
    </ConfirmationDialog>
  );
};

Default.storyName = 'Confirmation Dialog';
