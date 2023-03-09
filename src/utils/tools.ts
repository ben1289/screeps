/**
 * map 数组值追加
 * @param map
 * @param key
 * @param value
 */
export function mapArrValAdd<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  if (map.has(key)) {
    map.get(key)?.push(value);
  } else {
    map.set(key, [value]);
  }
}
