import { Door as RmfDoor, DoorMode as RmfDoorMode } from 'rmf-models';

export enum DoorType {
  SingleSwing = RmfDoor.DOOR_TYPE_SINGLE_SWING,
  SingleSliding = RmfDoor.DOOR_TYPE_SINGLE_SLIDING,
  SingleTelescope = RmfDoor.DOOR_TYPE_SINGLE_TELESCOPE,
  DoubleSwing = RmfDoor.DOOR_TYPE_DOUBLE_SWING,
  DoubleSliding = RmfDoor.DOOR_TYPE_DOUBLE_SLIDING,
  DoubleTelescope = RmfDoor.DOOR_TYPE_DOUBLE_TELESCOPE,
}

export enum DoorMotion {
  Clockwise = 1,
  AntiClockwise = -1,
}

export enum DoorMode {
  Open = RmfDoorMode.MODE_OPEN,
  Closed = RmfDoorMode.MODE_CLOSED,
  Moving = RmfDoorMode.MODE_MOVING,
}

export interface DoorData {
  level: string;
  door: RmfDoor;
}

export function doorModeToString(doorMode?: number): string {
  if (doorMode === undefined) {
    return 'N/A';
  }
  switch (doorMode) {
    case RmfDoorMode.MODE_OPEN:
      return '열림';
    case RmfDoorMode.MODE_CLOSED:
      return '닫힘';
    case RmfDoorMode.MODE_MOVING:
      return '이동중';
    default:
      return '알수없음';
  }
}

export function doorTypeToString(doorType: number): string {
  switch (doorType) {
    case RmfDoor.DOOR_TYPE_DOUBLE_SLIDING:
      return '더블 슬라이딩';
    case RmfDoor.DOOR_TYPE_DOUBLE_SWING:
      return '더블 스윙';
    case RmfDoor.DOOR_TYPE_DOUBLE_TELESCOPE:
      return '더블 텔레스코프';
    case RmfDoor.DOOR_TYPE_SINGLE_SLIDING:
      return '싱글 슬라이딩';
    case RmfDoor.DOOR_TYPE_SINGLE_SWING:
      return '싱글 스윙';
    case RmfDoor.DOOR_TYPE_SINGLE_TELESCOPE:
      return '싱글 텔레스코프';
    default:
      return `알수없음 (${doorType})`;
  }
}
