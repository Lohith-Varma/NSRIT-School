import type { StyleProp } from 'react-native';

/** Merge styles without `false` entries — required for React Native Web */
export function sx<T>(...parts: (StyleProp<T> | false | null | undefined)[]): StyleProp<T> {
  const filtered = parts.filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return filtered as StyleProp<T>;
}
