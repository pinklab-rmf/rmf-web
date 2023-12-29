import { WorkspaceState } from '../workspace';

export const robotsWorkspace: WorkspaceState = {
  layout: [
    { i: 'robots', x: 0, y: 0, w: 7, h: 5 },
    { i: 'map', x: 8, y: 0, w: 5, h: 12 },
    { i: 'doors', x: 0, y: 0, w: 7, h: 4 },
    { i: 'lifts', x: 0, y: 0, w: 7, h: 3 },
  ],
  windows: [
    { key: 'robots', appName: '로봇' },
    { key: 'map', appName: '맵' },
    { key: 'doors', appName: '문' },
    { key: 'lifts', appName: '리프트' },
  ],
};
