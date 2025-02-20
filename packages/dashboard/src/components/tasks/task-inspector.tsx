import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { CardContent, useTheme } from '@mui/material';
import { TaskEventLog, TaskState } from 'api-client';
import React from 'react';
import { AppControllerContext } from '../app-contexts';
import { AppEvents } from '../app-events';
import { RmfAppContext } from '../rmf-app';
import { TaskInfo } from 'react-components';
import { UserProfileContext } from 'rmf-auth';
import { Enforcer } from '../permissions';
import { TaskLogs } from './task-logs';

export interface TableDataGridState {
  task: TaskState | null;
  onClose: () => void;
}

export function TaskInspector({ task, onClose }: TableDataGridState): JSX.Element {
  const theme = useTheme();
  const rmf = React.useContext(RmfAppContext);
  const appController = React.useContext(AppControllerContext);

  const [taskState, setTaskState] = React.useState<TaskState | null>(null);
  const [taskLogs, setTaskLogs] = React.useState<TaskEventLog | null>(null);
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    if (!rmf || !task) {
      setTaskState(null);
      setTaskLogs(null);
      return;
    }
    const sub = rmf.getTaskStateObs(task.booking.id).subscribe((subscribedTask) => {
      (async () => {
        try {
          const logs = (
            await rmf.tasksApi.getTaskLogTasksTaskIdLogGet(
              subscribedTask.booking.id,
              `0,${Number.MAX_SAFE_INTEGER}`,
            )
          ).data;
          setTaskLogs(logs);
        } catch {
          console.log(`${subscribedTask.booking.id} 작업 로그를 가져오지 못했습니다 `);
          setTaskLogs(null);
        }
        setTaskState(subscribedTask);
      })();
    });
    return () => sub.unsubscribe();
  }, [rmf, task]);

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
        throw new Error('tasks api not available');
      }
      await rmf.tasksApi?.postCancelTaskTasksCancelTaskPost({
        type: 'cancel_task_request',
        task_id: taskState.booking.id,
      });
      appController.showAlert('success', '작업을 성공적으로 취소했습니다');
      AppEvents.taskSelect.next(null);
    } catch (e) {
      appController.showAlert('error', `작업을 취소하는 데 실패했습니다: ${(e as Error).message}`);
    }
  }, [appController, taskState, rmf]);

  return (
    <>
      <Grid container wrap="nowrap" direction="column" height="100%">
        <Dialog
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            onClose();
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DialogTitle id="scroll-dialog-title" align="center">
                작업: {task?.booking.id}
              </DialogTitle>
            </Grid>
          </Grid>
          <DialogContent style={{ height: 700 }} dividers={true}>
            <Box component="div" sx={{ position: 'relative' }}>
              <Grid container direction="row" wrap="nowrap" height="100%">
                <Grid item xs={6}>
                  {taskState ? (
                    <>
                      <CardContent sx={{ overflow: 'auto' }}>
                        <TaskInfo task={taskState} title="세부 정보" />
                      </CardContent>
                      <Grid item paddingLeft={2} paddingRight={2}>
                        <Button
                          style={{
                            marginTop: theme.spacing(1),
                            marginBottom: theme.spacing(1),
                          }}
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
                          자세한 정보를 보려면 작업을 클릭하세요
                        </Typography>
                      </CardContent>
                    </Grid>
                  )}
                </Grid>
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                />
                <Grid item xs={6}>
                  <CardContent>
                    <TaskLogs taskLog={taskLogs} taskState={taskState} title="로그" />
                  </CardContent>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Dialog>
      </Grid>
    </>
  );
}
