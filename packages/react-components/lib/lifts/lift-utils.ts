import { LiftRequest as RmfLiftRequest, LiftState as RmfLiftState } from 'rmf-models';

export function liftModeToString(liftMode?: number): string {
  if (liftMode === undefined) {
    return `Unknown (${liftMode})`;
  }
  switch (liftMode) {
    case RmfLiftState.MODE_AGV:
      return '자율 주행 로봇';
    case RmfLiftState.MODE_EMERGENCY:
      return '비상 상황';
    case RmfLiftState.MODE_FIRE:
      return '화재';
    case RmfLiftState.MODE_HUMAN:
      return '사람';
    case RmfLiftState.MODE_OFFLINE:
      return '오프라인';
    default:
      return `알수없음 (${liftMode})`;
  }
}

export function doorStateToString(doorState?: number): string {
  if (doorState === undefined) return 'Unknown';

  switch (doorState) {
    case RmfLiftState.DOOR_OPEN:
      return '열림';
    case RmfLiftState.DOOR_CLOSED:
      return '닫힘';
    case RmfLiftState.DOOR_MOVING:
      return '이동중';
    default:
      return `알수없음 (${doorState})`;
  }
}

export function motionStateToString(motionState?: number): string {
  if (motionState === undefined) return 'Unknown';

  switch (motionState) {
    case RmfLiftState.MOTION_DOWN:
      return 'Down';
    case RmfLiftState.MOTION_STOPPED:
      return 'Stopped';
    case RmfLiftState.MOTION_UP:
      return 'Up';
    default:
      return `Unknown (${motionState})`;
  }
}

export const requestModes = [
  RmfLiftRequest.REQUEST_AGV_MODE,
  RmfLiftRequest.REQUEST_HUMAN_MODE,
  RmfLiftRequest.REQUEST_END_SESSION,
];

export const requestModeStrings: Record<number, string> = {
  [RmfLiftRequest.REQUEST_END_SESSION]: '세션 종료',
  [RmfLiftRequest.REQUEST_AGV_MODE]: '자율 주행 로봇',
  [RmfLiftRequest.REQUEST_HUMAN_MODE]: '사람',
};

export function requestModeToString(requestMode: number): string {
  return requestModeStrings[requestMode] || `Unknown (${requestMode})`;
}

export const requestDoorModes = [RmfLiftRequest.DOOR_OPEN, RmfLiftRequest.DOOR_CLOSED];

export const requestDoorModeStrings: Record<number, string> = {
  [RmfLiftRequest.DOOR_OPEN]: '열림',
  [RmfLiftRequest.DOOR_CLOSED]: '닫힘',
};

export function requestDoorModeToString(requestDoorMode: number): string {
  return requestDoorModeStrings[requestDoorMode] || 'Unknown';
}
