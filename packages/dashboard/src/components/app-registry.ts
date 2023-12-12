import { BeaconsApp } from './beacons-app';
import { DoorsApp } from './doors-app';
import { LiftsApp } from './lifts-app';
import { MapApp } from './map-app';
import { RobotInfoApp } from './robots/robot-info-app';
import { RobotsApp } from './robots/robots-app';
import { TaskDetailsApp } from './tasks/task-details-app';
import { TaskLogsApp } from './tasks/task-logs-app';
import { TasksApp } from './tasks/tasks-app';

export const AppRegistry = {
  비콘: BeaconsApp,
  문: DoorsApp,
  리프트: LiftsApp,
  지도: MapApp,
  작업: TasksApp,
  '작업 세부 정보': TaskDetailsApp,
  '작업 로그': TaskLogsApp,
  로봇: RobotsApp,
  '로봇 정보': RobotInfoApp,
};
