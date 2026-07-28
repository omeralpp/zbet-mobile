export const colors = {
  background: "#04101E",
  backgroundElevated: "#071726",
  surface: "#0A1D31",
  surfaceStrong: "#102A43",
  border: "#173B59",
  borderSoft: "#102E48",
  text: "#F4F8FC",
  textMuted: "#94A9BC",
  textSubtle: "#6E879D",
  blue: "#1597E5",
  blueSoft: "#0F5F91",
  green: "#62E66D",
  greenSoft: "#174A32",
  gold: "#F5C542",
  goldSoft: "#4A3C12",
  red: "#FF6573",
  redSoft: "#4D2028",
  orange: "#FF9A55",
  white: "#FFFFFF",
  black: "#000000"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999
} as const;

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4
  }
} as const;
