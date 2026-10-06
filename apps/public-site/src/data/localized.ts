export interface LocalizedCopy {
  en: string;
  es: string;
}

export const localize = (value: string | LocalizedCopy): LocalizedCopy => (
  typeof value === "string" ? { en: value, es: value } : value
);
