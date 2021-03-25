// There are two ways in which we use the PF color palette.  In both cases we should be using the
// defined color variables such that we pick up any changes PF makes in newer releases. The typical
// use is to set CSS colors and that can be done using the typical CSS 'var()' approach.  In some cases
// we need the actual hex value and for that we need to resolve the variable.

// Colors used by Kiali for CSS
export enum PFColors {
  Black100 = 'var(--pf-global--palette--black-100)',
  Black150 = 'var(--pf-global--palette--black-150)', // use instead of GrayBackground
  Black600 = 'var(--pf-global--palette--black-600)', // use instead of Gray
  Black800 = 'var(--pf-global--palette--black-800)',
  Black1000 = 'var(--pf-global--palette--black-1000)',
  Blue200 = 'var(--pf-global--palette--blue-200)',
  Blue300 = 'var(--pf-global--palette--blue-300)',
  Blue400 = 'var(--pf-global--palette--blue-400)',
  Blue500 = 'var(--pf-global--palette--blue-500)',
  Green400 = 'var(--pf-global--palette--green-400)',
  Green500 = 'var(--pf-global--palette--green-500)',
  Orange400 = 'var(--pf-global--palette--orange-400)',
  Purple400 = 'var(--pf-global--palette--purple-400)',
  Red100 = 'var(--pf-global--palette--red-100)',
  Red200 = 'var(--pf-global--palette--red-200)',
  White = 'var(--pf-global--palette--white)',

  // semantic kiali colors
  Active = 'var(--pf-global--active-color--400)',
  ActiveText = 'var(--pf-global--primary-color--200)',
  Replay = 'var(--pf-global--active-color--300)',

  // Health/Alert colors https://www.patternfly.org/v4/design-guidelines/styles/colors

  Danger = 'var(--pf-global--danger-color--100)',
  DangerBackground = 'var(--pf-global--danger-color--200)',
  Info = 'var(--pf-global--info-color--100)',
  InfoBackground = 'var(--pf-global--info-color--200)',
  // TODO: go back to var when PF vars is properly updated
  // Success = 'var(--pf-global--success-color--100)',
  Success = '#3e8635',
  SuccessBackground = 'var(--pf-global--success-color--200)',
  Warning = 'var(--pf-global--warning-color--100)',
  WarningBackground = 'var(--pf-global--warning-color--200)'
}

/*
export enum PfColors {

  White = '#fff',
  Black = '#030303',

  Blue = '#0088ce', // Blue400
  Cyan = '#007a87', // Cyan400
  Gold = '#f0ab00', // Gold400
  Green = '#3f9c35', // Green400
  LightBlue = '#00b9e4', // LightBlue400
  LightGreen = '#92d400', // LightGreen400
  Orange = '#ec7a08', // Orange400
  Red = '#cc0000', // Red100

  //
  // Kiali colors that use PF colors
  //
  Gray = Black600,
  GrayBackground = Black150
}
*/

// The hex string value of the PF CSS variable
export type PFColorVal = string;

// Color values used by Kiali

export type PFColorValues = {
  Black100: PFColorVal;
  Black150: PFColorVal;
  Black200: PFColorVal;
  Black400: PFColorVal;
  Black500: PFColorVal;
  Black600: PFColorVal;
  Black1000: PFColorVal;
  Blue50: PFColorVal;
  Blue200: PFColorVal;
  Blue300: PFColorVal;
  Blue400: PFColorVal;
  Blue500: PFColorVal;
  Blue600: PFColorVal;
  Cyan300: PFColorVal;
  Gold400: PFColorVal;
  Green400: PFColorVal;
  Orange400: PFColorVal;
  Purple200: PFColorVal;
  Red200: PFColorVal;
  Red500: PFColorVal;
  White: PFColorVal;

  // Health/Alert colors https://www.patternfly.org/v4/design-guidelines/styles/colors
  Danger: PFColorVal;
  DangerBackground: PFColorVal;
  Info: PFColorVal;
  InfoBackground: PFColorVal;
  Success: PFColorVal;
  SuccessBackground: PFColorVal;
  Warning: PFColorVal;
  WarningBackground: PFColorVal;

  // special values for rates charts
  ChartDanger: PFColorVal;
  ChartOther: PFColorVal;
  ChartWarning: PFColorVal;
};

export let PFColorVals: PFColorValues;

export const setPFColorVals = (element: Element) => {
  PFColorVals = {
    // color values used by kiali
    Black100: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-100'),
    Black150: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-150'), // use instead of Gray
    Black200: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-200'),
    Black400: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-400'),
    Black500: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-500'),
    Black600: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-600'),
    Black1000: getComputedStyle(element).getPropertyValue('--pf-global--palette--black-1000'),
    Blue50: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-50'),
    Blue200: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-200'),
    Blue300: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-300'),
    Blue400: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-400'),
    Blue500: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-500'),
    Blue600: getComputedStyle(element).getPropertyValue('--pf-global--palette--blue-600'),
    Cyan300: getComputedStyle(element).getPropertyValue('--pf-global--palette--cyan-300'),
    Gold400: getComputedStyle(element).getPropertyValue('--pf-global--palette--gold-400'),
    Green400: getComputedStyle(element).getPropertyValue('--pf-global--palette--green-400'),
    Orange400: getComputedStyle(element).getPropertyValue('--pf-global--palette--orange-400'),
    Purple200: getComputedStyle(element).getPropertyValue('--pf-global--palette--purple-200'),
    Red200: getComputedStyle(element).getPropertyValue('--pf-global--palette--red-200'),
    Red500: getComputedStyle(element).getPropertyValue('--pf-global--palette--red-500'),
    White: getComputedStyle(element).getPropertyValue('--pf-global--palette--white'),

    // status color values used by kiali
    // override Success and SuccessBackground with newer PF definitions, older version was bad
    Danger: getComputedStyle(element).getPropertyValue('--pf-global--danger-color--100'),
    DangerBackground: getComputedStyle(element).getPropertyValue('--pf-global--danger-color--200'),
    Info: getComputedStyle(element).getPropertyValue('--pf-global--info-color--100'),
    InfoBackground: getComputedStyle(element).getPropertyValue('--pf-global--info-color--200'),
    Success: '#3E8635', // getComputedStyle(element).getPropertyValue('--pf-global--success-color--100'),
    SuccessBackground: '#1E4F18', // getComputedStyle(element).getPropertyValue('--pf-global--success-color--200'),
    Warning: getComputedStyle(element).getPropertyValue('--pf-global--warning-color--100'),
    WarningBackground: getComputedStyle(element).getPropertyValue('--pf-global--warning-color--200'),

    // chart-specific color values, for rates charts where 4xx is really Danger not Warning
    ChartDanger: getComputedStyle(element).getPropertyValue('--pf-global--danger-color--300'),
    ChartOther: getComputedStyle(element).getPropertyValue('--pf-global--palette-black-1000'),
    ChartWarning: getComputedStyle(element).getPropertyValue('--pf-global--danger-color--100')
  };
};

export const withAlpha = (color: PFColorVal, hexAlpha: string) => {
  return color + hexAlpha;
};
