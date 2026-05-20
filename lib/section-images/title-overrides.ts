function storageKey(section: string) {
  return `kohinoor-image-titles-${section}`;
}

export function getTitleOverrides(section: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(section));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function setTitleOverride(
  section: string,
  imageId: string,
  title: string
): void {
  const overrides = getTitleOverrides(section);
  overrides[imageId] = title;
  localStorage.setItem(storageKey(section), JSON.stringify(overrides));
}

export function removeTitleOverride(section: string, imageId: string): void {
  const overrides = getTitleOverrides(section);
  delete overrides[imageId];
  localStorage.setItem(storageKey(section), JSON.stringify(overrides));
}
