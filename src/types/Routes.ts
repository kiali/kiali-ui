export interface MenuItem {
  iconClass: string;
  iconNext: string;
  title: string;
  to: string;
  pathsActive?: RegExp[];
}

export interface Path {
  path: string;
  component: any;
}
