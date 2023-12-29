import { Status2 } from 'api-client';
import { RobotMode as RmfRobotMode } from 'rmf-models';

/**
 * Returns a uniquely identifiable string representing a robot.
 */
export function robotHash(name: string, fleet: string): string {
  return `${name}__${fleet}`;
}

export function robotStatusToUpperCase(status: Status2): string {
  switch (status) {
    case Status2.Charging:
      return '충전 중';
    case Status2.Idle:
      return '대기';
    case Status2.Working:
      return '동작 중';
    case Status2.Offline:
      return '오프라인';
    case Status2.Uninitialized:
      return '초기화되지 않음';
    case Status2.Shutdown:
      return '종료됨';
    case Status2.Error:
      return '에러';
    default:
      return `알수없음 (${status})`;
  }
}

export function robotModeToString(robotMode: RmfRobotMode): string {
  switch (robotMode.mode) {
    case RmfRobotMode.MODE_CHARGING:
      return '충전 중';
    case RmfRobotMode.MODE_DOCKING:
      return '도킹 중';
    case RmfRobotMode.MODE_EMERGENCY:
      return '비상 상황';
    case RmfRobotMode.MODE_GOING_HOME:
      return '초기 위치로 이동중';
    case RmfRobotMode.MODE_IDLE:
      return '대기';
    case RmfRobotMode.MODE_MOVING:
      return '이동 중';
    case RmfRobotMode.MODE_PAUSED:
      return '일시 정지됨';
    case RmfRobotMode.MODE_WAITING:
      return '대기 중';
    default:
      return `알수없음 (${robotMode.mode})`;
  }
}
