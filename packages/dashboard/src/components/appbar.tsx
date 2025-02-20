import {
  AccountCircle,
  AddOutlined,
  Help,
  Notifications,
  Report,
  Settings,
  Warning as Issue,
} from '@mui/icons-material';
import {
  Badge,
  Button,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ApiServerModelsTortoiseModelsAlertsAlertLeaf as Alert,
  TaskFavoritePydantic as TaskFavorite,
  TaskRequest,
} from 'api-client';
import React from 'react';
import {
  AppBarTab,
  CreateTaskForm,
  CreateTaskFormProps,
  HeaderBar,
  LogoButton,
  NavigationBar,
  useAsync,
} from 'react-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfileContext } from 'rmf-auth';
import { logoSize } from '../managers/resource-manager';
import { ThemeMode } from '../settings';
import {
  AdminRoute,
  CustomRoute1,
  CustomRoute2,
  DashboardRoute,
  RobotsRoute,
  TasksRoute,
} from '../util/url';
import {
  AppConfigContext,
  AppControllerContext,
  ResourcesContext,
  SettingsContext,
} from './app-contexts';
import { AppEvents } from './app-events';
import { RmfAppContext } from './rmf-app';
import { parseTasksFile } from './tasks/utils';
import { Subscription } from 'rxjs';
import { formatDistance } from 'date-fns';
import { useCreateTaskFormData } from '../hooks/useCreateTaskForm';
import { toApiSchedule } from './tasks/utils';
import useGetUsername from '../hooks/useFetchUser';

export type TabValue = 'infrastructure' | 'robots' | 'tasks' | 'custom1' | 'custom2' | 'admin';

const locationToTabValue = (pathname: string): TabValue | undefined => {
  const routes: { prefix: string; tabValue: TabValue }[] = [
    { prefix: RobotsRoute, tabValue: 'robots' },
    { prefix: TasksRoute, tabValue: 'tasks' },
    { prefix: CustomRoute1, tabValue: 'custom1' },
    { prefix: CustomRoute2, tabValue: 'custom2' },
    { prefix: AdminRoute.replace(/\*/g, ''), tabValue: 'admin' },
    { prefix: DashboardRoute, tabValue: 'infrastructure' },
  ];

  // `DashboardRoute` being the root, it is a prefix to all routes, so we need to check exactly.
  const matchingRoute = routes.find((route) => pathname.startsWith(route.prefix));
  return matchingRoute?.tabValue;
};

function AppSettings() {
  const settings = React.useContext(SettingsContext);
  const appController = React.useContext(AppControllerContext);
  return (
    <FormControl>
      <FormLabel id="theme-label">테마</FormLabel>
      <RadioGroup row aria-labelledby="theme-label">
        <FormControlLabel
          value={ThemeMode.Default}
          control={<Radio />}
          label="기본모드"
          checked={settings.themeMode === ThemeMode.Default}
          onChange={() =>
            appController.updateSettings({ ...settings, themeMode: ThemeMode.Default })
          }
        />
        <FormControlLabel
          value={ThemeMode.RmfLight}
          control={<Radio />}
          label="RMF 라이트모드"
          checked={settings.themeMode === ThemeMode.RmfLight}
          onChange={() =>
            appController.updateSettings({ ...settings, themeMode: ThemeMode.RmfLight })
          }
        />
        <FormControlLabel
          value={ThemeMode.RmfDark}
          control={<Radio />}
          label="RMF 다크모드"
          checked={settings.themeMode === ThemeMode.RmfDark}
          onChange={() =>
            appController.updateSettings({ ...settings, themeMode: ThemeMode.RmfDark })
          }
        />
      </RadioGroup>
    </FormControl>
  );
}

export interface AppBarProps {
  extraToolbarItems?: React.ReactNode;

  // TODO: change the alarm status to required when we have an alarm
  // service working properly in the backend
  alarmState?: boolean | null;
}

export const AppBar = React.memo(({ extraToolbarItems }: AppBarProps): React.ReactElement => {
  const rmf = React.useContext(RmfAppContext);
  const resourceManager = React.useContext(ResourcesContext);
  const { showAlert } = React.useContext(AppControllerContext);
  const navigate = useNavigate();
  const location = useLocation();
  const tabValue = React.useMemo(() => locationToTabValue(location.pathname), [location]);
  const logoResourcesContext = React.useContext(ResourcesContext)?.logos;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { authenticator } = React.useContext(AppConfigContext);
  const profile = React.useContext(UserProfileContext);
  const safeAsync = useAsync();
  const [brandingIconPath, setBrandingIconPath] = React.useState<string>('');
  const [settingsAnchor, setSettingsAnchor] = React.useState<HTMLElement | null>(null);
  const [openCreateTaskForm, setOpenCreateTaskForm] = React.useState(false);
  const [favoritesTasks, setFavoritesTasks] = React.useState<TaskFavorite[]>([]);
  const [refreshTaskAppCount, setRefreshTaskAppCount] = React.useState(0);
  const [alertListAnchor, setAlertListAnchor] = React.useState<HTMLElement | null>(null);
  const [unacknowledgedAlertsNum, setUnacknowledgedAlertsNum] = React.useState(0);
  const [unacknowledgedAlertList, setUnacknowledgedAlertList] = React.useState<Alert[]>([]);

  const curTheme = React.useContext(SettingsContext).themeMode;
  const { waypointNames, pickupPoints, dropoffPoints, cleaningZoneNames } =
    useCreateTaskFormData(rmf);
  const username = useGetUsername(rmf);

  async function handleLogout(): Promise<void> {
    try {
      await authenticator.logout();
    } catch (e) {
      console.error(`error logging out: ${(e as Error).message}`);
    }
  }

  React.useEffect(() => {
    const sub = AppEvents.refreshTaskApp.subscribe({
      next: () => setRefreshTaskAppCount((oldValue) => ++oldValue),
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!logoResourcesContext) return;
    (async () => {
      setBrandingIconPath(await safeAsync(logoResourcesContext.getHeaderLogoPath(curTheme)));
    })();
  }, [logoResourcesContext, safeAsync, curTheme]);

  React.useEffect(() => {
    if (!rmf) {
      return;
    }

    const subs: Subscription[] = [];
    subs.push(
      AppEvents.refreshAlert.subscribe({
        next: () => {
          (async () => {
            const resp = await rmf.alertsApi.getAlertsAlertsGet();
            const alerts = resp.data as Alert[];
            setUnacknowledgedAlertsNum(
              alerts.filter(
                (alert) => !(alert.acknowledged_by && alert.unix_millis_acknowledged_time),
              ).length,
            );
          })();
        },
      }),
    );

    // Get the initial number of unacknowledged alerts
    (async () => {
      const resp = await rmf.alertsApi.getAlertsAlertsGet();
      const alerts = resp.data as Alert[];
      setUnacknowledgedAlertsNum(
        alerts.filter((alert) => !(alert.acknowledged_by && alert.unix_millis_acknowledged_time))
          .length,
      );
    })();
    return () => subs.forEach((s) => s.unsubscribe());
  }, [rmf]);

  const submitTasks = React.useCallback<Required<CreateTaskFormProps>['submitTasks']>(
    async (taskRequests, schedule) => {
      if (!rmf) {
        throw new Error('tasks api not available');
      }
      if (!schedule) {
        await Promise.all(
          taskRequests.map((request) =>
            rmf.tasksApi.postDispatchTaskTasksDispatchTaskPost({
              type: 'dispatch_task_request',
              request,
            }),
          ),
        );
      } else {
        const scheduleRequests = taskRequests.map((req) => toApiSchedule(req, schedule));
        await Promise.all(
          scheduleRequests.map((req) => rmf.tasksApi.postScheduledTaskScheduledTasksPost(req)),
        );
      }
      AppEvents.refreshTaskApp.next();
    },
    [rmf],
  );

  const uploadFileInputRef = React.useRef<HTMLInputElement>(null);
  const tasksFromFile = (): Promise<TaskRequest[]> => {
    return new Promise((res) => {
      const fileInputEl = uploadFileInputRef.current;
      if (!fileInputEl) {
        return [];
      }
      let taskFiles: TaskRequest[];
      const listener = async () => {
        try {
          if (!fileInputEl.files || fileInputEl.files.length === 0) {
            return res([]);
          }
          try {
            taskFiles = parseTasksFile(await fileInputEl.files[0].text());
          } catch (err) {
            showAlert('error', (err as Error).message, 5000);
            return res([]);
          }
          // only submit tasks when all tasks are error free
          return res(taskFiles);
        } finally {
          fileInputEl.removeEventListener('input', listener);
          fileInputEl.value = '';
        }
      };
      fileInputEl.addEventListener('input', listener);
      fileInputEl.click();
    });
  };

  //#region 'Favorite Task'
  React.useEffect(() => {
    if (!rmf) {
      return;
    }
    (async () => {
      const resp = await rmf.tasksApi.getFavoritesTasksFavoriteTasksGet();

      const results = resp.data as TaskFavorite[];
      setFavoritesTasks(results);
    })();

    return () => {
      setFavoritesTasks([]);
    };
  }, [rmf, refreshTaskAppCount]);

  const submitFavoriteTask = React.useCallback<Required<CreateTaskFormProps>['submitFavoriteTask']>(
    async (taskFavoriteRequest) => {
      if (!rmf) {
        throw new Error('tasks api not available');
      }
      await rmf.tasksApi.postFavoriteTaskFavoriteTasksPost(taskFavoriteRequest);
      AppEvents.refreshTaskApp.next();
    },
    [rmf],
  );

  const deleteFavoriteTask = React.useCallback<Required<CreateTaskFormProps>['deleteFavoriteTask']>(
    async (favoriteTask) => {
      if (!rmf) {
        throw new Error('tasks api not available');
      }
      if (!favoriteTask.id) {
        throw new Error('Id is needed');
      }

      await rmf.tasksApi.deleteFavoriteTaskFavoriteTasksFavoriteTaskIdDelete(favoriteTask.id);
      AppEvents.refreshTaskApp.next();
    },
    [rmf],
  );
  //#endregion 'Favorite Task'

  const handleOpenAlertList = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!rmf) {
      return;
    }
    (async () => {
      const { data: alerts } = await rmf.alertsApi.getAlertsAlertsGet();
      const unackList = alerts.filter(
        (alert) => !alert.acknowledged_by && !alert.unix_millis_acknowledged_time,
      );
      setUnacknowledgedAlertList(unackList.reverse());
    })();
    setAlertListAnchor(event.currentTarget);
  };

  const openAlertDialog = (alert: Alert) => {
    AppEvents.alertListOpenedAlert.next(alert);
  };

  const timeDistance = (time: number) => {
    return formatDistance(new Date(), new Date(time));
  };

  return (
    <>
      <HeaderBar>
        <LogoButton src={brandingIconPath} alt="logo" sx={{ width: logoSize }} />
        <NavigationBar value={tabValue}>
          <AppBarTab
            label="맵"
            value="infrastructure"
            aria-label="맵"
            onTabClick={() => navigate(DashboardRoute)}
          />
          <AppBarTab
            label="시스템 제어"
            value="robots"
            aria-label="시스템 제어"
            onTabClick={() => navigate(RobotsRoute)}
          />
          <AppBarTab
            label="작업 정보"
            value="tasks"
            aria-label="작업 정보"
            onTabClick={() => navigate(TasksRoute)}
          />
          <AppBarTab
            label="커스텀 1"
            value="custom1"
            aria-label="Custom 1"
            onTabClick={() => navigate(CustomRoute1)}
          />
          <AppBarTab
            label="커스텀 2"
            value="custom2"
            aria-label="커스텀 2"
            onTabClick={() => navigate(CustomRoute2)}
          />
          {profile?.user.is_admin && (
            <AppBarTab
              label="관리자"
              value="admin"
              aria-label="관리자"
              onTabClick={() => navigate(AdminRoute)}
            />
          )}
        </NavigationBar>
        <Toolbar variant="dense" sx={{ textAlign: 'right', flexGrow: -1 }}>
          <Button
            id="create-new-task-button"
            aria-label="새 작업"
            color="secondary"
            variant="contained"
            size="small"
            onClick={() => setOpenCreateTaskForm(true)}
          >
            <AddOutlined />새 작업
          </Button>
          <Tooltip title="알림">
            <IconButton
              id="alert-list-button"
              aria-label="alert-list-button"
              color="inherit"
              onClick={handleOpenAlertList}
            >
              <Badge badgeContent={unacknowledgedAlertsNum} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={alertListAnchor}
            open={!!alertListAnchor}
            onClose={() => setAlertListAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              style: {
                maxHeight: '20rem',
                maxWidth: '30rem',
              },
            }}
          >
            {unacknowledgedAlertList.length === 0 ? (
              <MenuItem dense disabled>
                <Typography variant="body2" noWrap>
                  미확인 알림 없음
                </Typography>
              </MenuItem>
            ) : (
              unacknowledgedAlertList.map((alert) => (
                <Tooltip
                  key={alert.id}
                  title={
                    <React.Fragment>
                      <Typography>알림</Typography>
                      <Typography>ID: {alert.original_id}</Typography>
                      <Typography>타입: {alert.category.toUpperCase()}</Typography>
                      <Typography>
                        생성: {new Date(alert.unix_millis_created_time).toLocaleString()}
                      </Typography>
                    </React.Fragment>
                  }
                  placement="right"
                >
                  <MenuItem
                    dense
                    onClick={() => {
                      openAlertDialog(alert);
                      setAlertListAnchor(null);
                    }}
                    divider
                  >
                    <Report />
                    <Typography variant="body2" mx={1} noWrap>
                      작업 {alert.original_id} 에서 알림이 왔습니다{' '}
                      {timeDistance(alert.unix_millis_created_time)} ago
                    </Typography>
                  </MenuItem>
                </Tooltip>
              ))
            )}
          </Menu>
          <Divider orientation="vertical" sx={{ marginLeft: 1, marginRight: 2 }} />
          <Typography variant="caption">Powered by Open-RMF</Typography>
          {extraToolbarItems}
          <Tooltip title="설정">
            <IconButton
              id="show-settings-btn"
              aria-label="설정"
              color="inherit"
              onClick={(ev) => setSettingsAnchor(ev.currentTarget)}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="도움말">
            <IconButton
              id="show-help-btn"
              aria-label="도움말"
              color="inherit"
              onClick={() => window.open(resourceManager?.helpLink, '_blank')}
            >
              <Help />
            </IconButton>
          </Tooltip>
          <Tooltip title="알려진 문제들">
            <IconButton
              id="show-warning-btn"
              aria-label="warning"
              color="inherit"
              onClick={() => window.open(resourceManager?.reportIssue, '_blank')}
            >
              <Issue />
            </IconButton>
          </Tooltip>
          {profile && (
            <>
              <Tooltip title="프로필">
                <IconButton
                  id="user-btn"
                  aria-label={'user-btn'}
                  color="inherit"
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem id="logout-btn" onClick={handleLogout}>
                  로그아웃
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </HeaderBar>
      <Menu
        anchorEl={settingsAnchor}
        open={!!settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
      >
        <CardContent>
          <AppSettings />
        </CardContent>
      </Menu>
      {openCreateTaskForm && (
        <CreateTaskForm
          user={username ? username : 'unknown user'}
          patrolWaypoints={waypointNames}
          cleaningZones={cleaningZoneNames}
          pickupPoints={pickupPoints}
          dropoffPoints={dropoffPoints}
          favoritesTasks={favoritesTasks}
          open={openCreateTaskForm}
          onClose={() => setOpenCreateTaskForm(false)}
          submitTasks={submitTasks}
          submitFavoriteTask={submitFavoriteTask}
          deleteFavoriteTask={deleteFavoriteTask}
          tasksFromFile={tasksFromFile}
          onSuccess={() => {
            setOpenCreateTaskForm(false);
            showAlert('success', '작업이 성공적으로 생성되었습니다');
          }}
          onFail={(e) => {
            showAlert('error', `작업 생성에 실패했습니다: ${e.message}`);
          }}
          onSuccessFavoriteTask={(message) => {
            showAlert('success', message);
          }}
          onFailFavoriteTask={(e) => {
            showAlert('error', `즐겨찾기 작업을 생성하거나 삭제하는 데 실패했습니다: ${e.message}`);
          }}
          onSuccessScheduling={() => {
            setOpenCreateTaskForm(false);
            showAlert('success', '일정이 성공적으로 생성되었습니다');
          }}
          onFailScheduling={(e) => {
            showAlert('error', `일정 제출에 실패했습니다: ${e.message}`);
          }}
        />
      )}
    </>
  );
});

export default AppBar;
