import { DispenserState as RmfDispenserState } from 'rmf-models';

export function dispenserModeToString(mode: number): string {
  switch (mode) {
    case RmfDispenserState.IDLE:
      return '대기';
    case RmfDispenserState.BUSY:
      return '온라인';
    case RmfDispenserState.OFFLINE:
      return '오프라인';
    default:
      return 'N/A';
  }
}
