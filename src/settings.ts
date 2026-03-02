export interface Settings {
  includeHidden: boolean;
  includeLocked: boolean;
  textSizeMin: number;
  strictTextSize: boolean;
}

export const defaultSettings: Settings = {
  includeHidden: false,
  includeLocked: false,
  textSizeMin: 12,
  strictTextSize: false,
};
