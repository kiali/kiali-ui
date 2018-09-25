export interface SortField {
  id: string;
  title: string;
  isNumeric: boolean;
  param: string;
  compare: (a: any, b: any) => number;
}
