import { Button, Typography } from '@mui/material';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import { Loading, LoadingProps } from './loading';

export default {
  title: 'Loading',
  component: Loading,
  argTypes: {
    loading: {
      defaultValue: false,
    },
  },
} as Meta;

export const LoadingButton: Story<LoadingProps> = (args) => {
  return (
    <>
      <Button variant="contained" disabled={args.loading}>
        <Loading {...args} size="1.5em" hideChildren>
          OK
        </Loading>
      </Button>
      <Typography style={{ marginTop: 8 }}>
        스토리북 컨트롤을 사용하여 로딩 상태를 변경하세요
      </Typography>
    </>
  );
};
