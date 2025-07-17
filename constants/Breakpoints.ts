// Responsive breakpoints for the app
export const Breakpoints = {
  MOBILE: 768,

  //needs to be tested on tabled sim
  TABLET: 1024,

  DESKTOP: 1440,

} as const;

export const isMobile = (width: number) => width < Breakpoints.MOBILE;
export const isTablet = (width: number) => width >= Breakpoints.MOBILE && width < Breakpoints.TABLET;
export const isDesktop = (width: number) => width >= Breakpoints.TABLET;
