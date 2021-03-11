import React from 'react';
import { SystemSummaryTaskState } from '../../lib';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tasks } from './test.utils';

it('expect all different task states to be calculated and rendered', () => {
  render(<SystemSummaryTaskState tasks={tasks} onClick={jasmine.createSpy()} />);
  // 1 task for each state, total 4 states
  expect(screen.queryAllByText('1').length).toEqual(4);
});

it('should call onClick when panel is clicked', () => {
  const onClick = jasmine.createSpy();
  render(<SystemSummaryTaskState tasks={tasks} onClick={onClick} />);
  userEvent.click(screen.getByLabelText('panel'));
  expect(onClick).toHaveBeenCalled();
});
