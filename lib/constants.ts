export const DESTRUCTION_TIMERS = [
  { label: '1 Hour', value: 1 },
  { label: '2 Hours', value: 2 },
  { label: '6 Hours', value: 6 },
  { label: '12 Hours', value: 12 },
  { label: '24 Hours', value: 24 },
  { label: '7 Days', value: 168 },
] as const;

export const INACTIVITY_THRESHOLD_HOURS = 24;

export const APP_NAME = 'TexLoop';

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TEXT_LENGTH = 50000;

export const SOCKET_EVENTS = {
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  TEXT_CHANGE: 'text:change',
  TEXT_UPDATE: 'text:update',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  ROOM_DELETED: 'room:deleted',
  PARTICIPANTS_UPDATE: 'participants:update',
} as const;