export const IS_SERVER = typeof window === "undefined";
export const localStore = IS_SERVER ? undefined : localStorage;

export function fixDuplicateLabels(RAW: { label: string }[]) {
  const fixed = [...RAW]; // create a copy;
  const labelToIndex = new Map<string, number[]>();
  for (const [idx, item] of fixed.entries()) {
    if (labelToIndex.has(item.label)) {
      labelToIndex.get(item.label)?.push(idx);
    } else {
      labelToIndex.set(item.label, [idx]);
    }
  }
  for (const [label, indexes] of labelToIndex.entries()) {
    if (indexes?.length <= 1) continue;
    for (const [idx, index] of indexes.entries()) {
      fixed[index].label = `${label} (${idx + 1})`;
    }
  }
  return fixed;
}
