export type ThemeOption = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextType {
  theme: ThemeOption;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeOption) => void;
}