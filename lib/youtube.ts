const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const HOST_SUFFIXES = ["youtube.com", "youtu.be"];

/** True when the value is a syntactically valid 11-char YouTube video id. */
export function isValidVideoId(value: string): boolean {
  return VIDEO_ID_PATTERN.test(value);
}

function isYoutubeHost(hostname: string): boolean {
  return HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

/**
 * Extracts the 11-character YouTube video id from a URL or a bare id.
 * Returns null when the input is empty, not a YouTube source, or malformed.
 */
export function extractVideoId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (VIDEO_ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (!isYoutubeHost(url.hostname)) return null;

  const fromQuery = url.searchParams.get("v");
  if (fromQuery && VIDEO_ID_PATTERN.test(fromQuery)) return fromQuery;

  const lastSegment = url.pathname.split("/").filter(Boolean).pop();
  if (lastSegment && VIDEO_ID_PATTERN.test(lastSegment)) return lastSegment;

  return null;
}
