import type { StyleProp } from 'react-native';

/** Merge styles without `false` entries — required for React Native Web */
export function sx(...parts: (StyleProp<any> | false | null | undefined)[]): StyleProp<any> {
  const filtered = parts.filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return filtered as StyleProp<any>;
}
