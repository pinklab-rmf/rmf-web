import { Divider, Typography } from '@mui/material';
import { Story } from '@storybook/react';
import React from 'react';
import { StatusLabel } from './status-label';

export default {
  title: 'Design Decisions',
};

const styles: Record<string, React.CSSProperties> = {
  spacing: {
    margin: '1rem 0',
  },
};

export const handleUnknown: Story = () => (
  <div>
    <Typography style={styles.spacing} variant="body1">
      가끔, 기기 상태는 다양한 이유로 <b>Unknown</b>으로 반환될 수 있습니다.
      <b>Unknown</b>은 상태 레이블의 너비에 너무 길기 때문에, 우리는 대신 회색 테두리가 적용된
      <b>N/A</b>로 표시합니다.
    </Typography>
    <Divider style={{ margin: '1rem 0' }} />
    <StatusLabel variant="unknown" />
  </div>
);
