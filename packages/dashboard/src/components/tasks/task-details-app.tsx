import { Button, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { TaskState } from 'api-client';
import React from 'react';
import { TaskInfo } from 'react-components';
import { UserProfileContext } from 'rmf-auth';
import { of, switchMap } from 'rxjs';
import { AppControllerContext } from '../app-contexts';
import { AppEvents } from '../app-events';
import { createMicroApp } from '../micro-app';
import { Enforcer } from '../permissions';
import { RmfAppContext } from '../rmf-app';

export const TaskDetailsApp = createMicroApp('작업 세부정보', () => {
  const theme = useTheme();
  const rmf = React.useContext(RmfAppContext);
  const appController = React.useContext(AppControllerContext);

  const [taskState, setTaskState] = React.useState<TaskState | null>(null);
  React.useEffect(() => {
    if (!rmf) {
      return;
    }
    const sub = AppEvents.taskSelect
      .pipe(
        switchMap((selectedTask) =>
          selectedTask ? rmf.getTaskStateObs(selectedTask.booking.id) : of(null),
        ),
      )
      .subscribe(setTaskState);
    return () => sub.unsubscribe();
  }, [rmf]);

  const profile = React.useContext(UserProfileContext);
  const taskCancellable =
    taskState &&
    profile &&
    Enforcer.canCancelTask(profile) &&
    taskState.status &&
    !['canceled', 'killed', 'completed', 'failed'].includes(taskState.status);
  const handleCancelTaskClick = React.useCallback<React.MouseEventHandler>(async () => {
    if (!taskState) {
      return;
    }
    try {
      if (!rmf) {
        throw new Error('작업 API 사용 불가');
      }
      await rmf.tasksApi?.postCancelTaskTasksCancelTaskPost({
        type: 'cancel_task_request',
        task_id: taskState.booking.id,
      });
      appController.showAlert('success', '작업이 성공적으로 취소되었습니다');
      AppEvents.taskSelect.next(null);
    } catch (e) {
      appController.showAlert('error', `작업 취소 실패: ${(e as Error).message}`);
    }
  }, [appController, taskState, rmf]);

  return (
    <Grid container direction="column" wrap="nowrap" height="100%">
      {taskState ? (
        <>
          <CardContent sx={{ overflow: 'auto' }}>
            <TaskInfo task={taskState} />
          </CardContent>
          <Grid item paddingLeft={2} paddingRight={2}>
            <Button
              style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
              fullWidth
              variant="contained"
              color="secondary"
              aria-label="Cancel Task"
              disabled={!taskCancellable}
              onClick={handleCancelTaskClick}
            >
              작업 취소
            </Button>
          </Grid>
        </>
      ) : (
        <Grid container wrap="nowrap" alignItems="center" style={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" align="center">
              작업을 클릭하여 더 많은 정보를 확인하세요
            </Typography>
          </CardContent>
        </Grid>
      )}
    </Grid>
  );
});
