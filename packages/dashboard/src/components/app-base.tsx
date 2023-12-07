import {
  Alert,
  AlertProps,
  createTheme,
  CssBaseline,
  GlobalStyles,
  Grid,
  Snackbar,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { rmfDark, rmfDarkLeaflet, rmfLight, AlertDialog } from 'react-components';
import { loadSettings, saveSettings, Settings, ThemeMode } from '../settings';
import { AppController, AppControllerContext, SettingsContext } from './app-contexts';
import AppBar from './appbar';
import { AlertStore } from './alert-store';

const DefaultAlertDuration = 2000;
const defaultTheme = createTheme();

/**
 * Contains various components that are essential to the app and provides contexts to control them.
 * Components include:
 *
 * - Settings
 * - Alerts
 *
 * Also provides `AppControllerContext` to allow children components to control them.
 */
export function AppBase({ children }: React.PropsWithChildren<{}>): JSX.Element | null {
  const [settings, setSettings] = React.useState(() => loadSettings());
  const [showAlert, setShowAlert] = React.useState(false);
  const [lowResolutionAlert, setLowResolutionAlert] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState<AlertProps['severity']>('error');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertDuration, setAlertDuration] = React.useState(DefaultAlertDuration);
  const [extraAppbarIcons, setExtraAppbarIcons] = React.useState<React.ReactNode>(null);

  const theme = React.useMemo(() => {
    switch (settings.themeMode) {
      case ThemeMode.RmfLight:
        return rmfLight;
      case ThemeMode.RmfDark:
        return rmfDark;
      default:
        return defaultTheme;
    }
  }, [settings.themeMode]);

  const updateSettings = React.useCallback((newSettings: Settings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const appController = React.useMemo<AppController>(
    () => ({
      updateSettings,
      showAlert: (severity, message, autoHideDuration) => {
        setAlertSeverity(severity);
        setAlertMessage(message);
        setShowAlert(true);
        setAlertDuration(autoHideDuration || DefaultAlertDuration);
      },
      setExtraAppbarIcons,
    }),
    [updateSettings],
  );

  React.useEffect(() => {
    const checkSize = () => {
      if (window.innerHeight < 1080 || window.innerWidth < 1080) {
        setLowResolutionAlert(true);
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
  }, []);

  const dismissDisplayAlert = () => {
    setLowResolutionAlert(false);
  };

  const lowResolutionDisplayAlert = () => {
    return (
      <AlertDialog
        key="display-alert"
        onDismiss={dismissDisplayAlert}
        title="낮은 디스플레이 해상도가 감지되었습니다."
        alertContents={[
          {
            title: '현재 해상도',
            value: `${window.innerWidth} x ${window.innerHeight}`,
          },
          {
            title: '최소 권장 해상도',
            value: '1920 x 1080',
          },
          {
            title: '메시지',
            value:
              '최대한 호환성을 보장하려면 줌을 줄여주세요. ' +
              '브라우저의 수준(Ctrl + -)또는 디스플레이를 설정하세요. ' +
              '또는 더 높은 해상도의 디스플레이 장치로 전환해주세요.',
          },
        ]}
        backgroundColor={theme.palette.background.default}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {settings.themeMode === ThemeMode.RmfDark && <GlobalStyles styles={rmfDarkLeaflet} />}
      <SettingsContext.Provider value={settings}>
        <AppControllerContext.Provider value={appController}>
          <AlertStore />
          {lowResolutionAlert && lowResolutionDisplayAlert()}
          <Grid
            container
            direction="column"
            style={{ width: '100%', height: '100%' }}
            wrap="nowrap"
          >
            <AppBar extraToolbarItems={extraAppbarIcons} />
            {children}
            {/* TODO: Support stacking of alerts */}
            <Snackbar
              open={showAlert}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
              autoHideDuration={alertDuration}
            >
              <Alert
                onClose={() => setShowAlert(false)}
                severity={alertSeverity}
                sx={{ width: '100%' }}
              >
                {alertMessage}
              </Alert>
            </Snackbar>
          </Grid>
        </AppControllerContext.Provider>
      </SettingsContext.Provider>
    </ThemeProvider>
  );
}
