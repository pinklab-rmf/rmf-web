import { Divider, Grid, Paper, PaperProps, styled, Typography, useTheme } from '@mui/material';
import type { EventState, TaskEventLog } from 'api-client';
import React from 'react';

type EventStatus = Required<EventState>['status'];

const prefix = 'task-logs';
const classes = {
  root: `${prefix}-root`,
};

export interface TaskLogsProps {
  taskLog: TaskEventLog;
  eventName: (phaseId: string, eventId: string) => string;
  eventStatus: (phaseId: string, eventId: string) => EventStatus | undefined;
}

const StyledPaper = styled((props: PaperProps) => <Paper variant="outlined" {...props} />)(
  ({ theme }) => ({
    [`&.${classes.root}`]: {
      padding: theme.spacing(1),
      width: '100%',
      flex: '0 0 auto',
      maxHeight: '100%',
      overflow: 'auto',
    },
  }),
);

export const TaskLogs: React.FC<TaskLogsProps> = ({ taskLog, eventName, eventStatus }) => {
  const theme = useTheme();

  function mapEventColor(eventStatus?: EventStatus) {
    // TODO(MXG): We should make this color selection consistent with the color
    // selection that's done for task states.
    if (eventStatus == null) return theme.palette.warning.light;

    switch (eventStatus) {
      case '초기화되지 않음':
      case '막힘':
      case '에러':
      case '실패':
        return theme.palette.error.dark;

      case '작업대기 중':
      case '대기':
        return theme.palette.info.light;

      case '진행 중':
        return theme.palette.success.light;

      case '지연됨':
        return theme.palette.warning.main;

      case '스킵됨':
      case '취소됨':
      case '종료됨':
        return theme.palette.error.light;

      case '완료됨':
        return theme.palette.info.light;

      default:
        return theme.palette.error.dark;
    }
  }

  return (
    <StyledPaper className={classes.root}>
      <Typography variant="h5" style={{ textAlign: 'center' }} gutterBottom>
        {taskLog.task_id}
      </Typography>
      <Divider />
      {taskLog.phases ? (
        Object.entries(taskLog.phases).map(([phaseId, phase]) => (
          <Paper sx={{ padding: theme.spacing(1) }} variant="outlined" key={phaseId}>
            <Typography variant="h6" fontWeight="bold" marginTop={3}>
              단계 - {phaseId}
            </Typography>

            <Divider />
            {phase.events ? (
              Object.entries(phase.events).map(([eventId, event]) => {
                return (
                  <div
                    style={{
                      marginTop: theme.spacing(1),
                      backgroundColor: mapEventColor(eventStatus(phaseId, eventId)),
                      padding: theme.spacing(1),
                      borderRadius: theme.spacing(1),
                    }}
                    key={eventId}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {eventName(phaseId, eventId)}
                    </Typography>
                    {event.length > 0 ? (
                      event.map((log, idx) => (
                        <Grid
                          container
                          key={idx}
                          direction="row"
                          justifyItems="center"
                          sx={{
                            backgroundColor: 'white',
                            marginTop: theme.spacing(1),
                            borderRadius: '8px',
                          }}
                        >
                          <Grid
                            item
                            xs={4}
                            sx={{
                              padding: theme.spacing(1),
                            }}
                          >
                            <Typography variant="body1">
                              {new Date(log.unix_millis_time).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={8}
                            sx={{
                              padding: theme.spacing(1),
                            }}
                          >
                            <Typography variant="body1">{log.text}</Typography>
                          </Grid>
                        </Grid>
                      ))
                    ) : (
                      <Typography
                        align="center"
                        sx={{ padding: theme.spacing(1) }}
                        fontWeight="bold"
                      >
                        로그 없음
                      </Typography>
                    )}
                  </div>
                );
              })
            ) : (
              <Typography align="center" sx={{ padding: theme.spacing(1) }} fontWeight="bold">
                이벤트 로그 없음
              </Typography>
            )}
          </Paper>
        ))
      ) : (
        <div>
          <Typography align="center" sx={{ padding: theme.spacing(1) }} fontWeight="bold">
            표시할 로그가 없습니다
          </Typography>
        </div>
      )}
    </StyledPaper>
  );
};
