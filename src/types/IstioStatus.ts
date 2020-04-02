export enum Status {
  Running = 'Running',
  NotRunning = 'Not Running',
  NotFound = 'Not Found',
}

export interface ComponentStatus {
  name: string;
  status: Status;
  is_core: boolean;
}

export interface ComponentStatuses {
  [name: string]: ComponentStatus;
}
