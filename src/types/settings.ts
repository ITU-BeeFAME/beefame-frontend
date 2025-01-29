import type { ColorPreset, Contrast, Direction, PaletteMode } from 'src/theme';

export type Layout = 'horizontal' | 'vertical';

export type NavColor = 'blend-in' | 'discrete' | 'evident';

export interface Settings {
  colorPreset?: ColorPreset;
  contrast?: Contrast;
  direction?: Direction;
  layout?: Layout;
  navColor?: NavColor;
  paletteMode?: PaletteMode;
  responsiveFontSizes?: boolean;
  stretch?: boolean;
}
