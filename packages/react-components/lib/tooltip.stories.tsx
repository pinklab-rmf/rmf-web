import { Typography } from '@mui/material';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import { Tooltip } from './tooltip';

export default {
  title: 'Tooltip',
  component: Tooltip,
} as Meta;

export const SimpleTooltip: Story = (args) => {
  return (
    <Tooltip title="This is a tooltip" id="test" enabled={true} {...args}>
      <Typography variant="h5">여기 위에 마우스를 올려주세요</Typography>
    </Tooltip>
  );
};
