/**
 * UR1IFE Design System - Typography
 * Age-adaptive font families and sizes
 */

export const fontFamilies = {
  parent: '"Inter", -apple-system, sans-serif',
  child8: '"Space Grotesk", sans-serif',  // more grown-up
  child4: '"Nunito", sans-serif',         // friendly, rounded
}

export const sizes = {
  // 4-year-old needs BIGGER text
  toddler: {
    xs: '16px',
    sm: '18px',
    base: '22px',
    lg: '28px',
    xl: '36px',
    xxl: '48px',
  },
  // 8-year-old can read smaller but still generous
  child: {
    xs: '14px',
    sm: '16px',
    base: '18px',
    lg: '24px',
    xl: '32px',
    xxl: '42px',
  },
  // Parents get standard sizing
  parent: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '20px',
    xl: '28px',
    xxl: '36px',
  }
}

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
}

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.02em',
}

/**
 * Get typography config for age
 */
export function getTypographyForAge(age) {
  if (age < 6) {
    return {
      fontFamily: fontFamilies.child4,
      sizes: sizes.toddler,
    }
  }
  if (age < 10) {
    return {
      fontFamily: fontFamilies.child8,
      sizes: sizes.child,
    }
  }
  return {
    fontFamily: fontFamilies.parent,
    sizes: sizes.parent,
  }
}

export const typography = {
  fontFamilies,
  sizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  getTypographyForAge,
}

export default typography
