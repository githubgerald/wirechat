/* Utilities for parsing and sanitizing common link embeds (YouTube focus)
 */

export function getYouTubeId(url) {
  if (!url) return null;
  try {
    // Normalize URL
    const u = new URL(url);
    // youtu.be short link
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
    // youtube.com
    if (u.hostname.endsWith('youtube.com')) {
      // common param v
      const v = u.searchParams.get('v');
      if (v) return v;
      // /embed/VIDEOID
      const parts = u.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function makeYouTubeEmbedUrl(originalUrl) {
  if (!originalUrl) return null;
  // If originalUrl contains extra text, try extracting the URL first
  try {
    // Try to extract a URL if the input isn't a proper URL
    let urlCandidate = originalUrl;
    try {
      // If it's not a valid URL, this will throw
      new URL(originalUrl);
    } catch (e) {
      const extracted = extractFirstUrlFromText(originalUrl);
      if (extracted) urlCandidate = extracted;
    }

    const id = getYouTubeId(urlCandidate);
    if (!id) return null;
    // Use the privacy-enhanced domain to reduce telemetry (youtube-nocookie)
    // Also add modestbranding and rel=0 where supported
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  } catch (e) {
    return null;
  }
}

export function sanitizeGenericUrl(originalUrl) {
  if (!originalUrl) return null;
  try {
    const u = new URL(originalUrl);
    // Remove common tracking params
    const paramsToRemove = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','ref','feature','si'];
    paramsToRemove.forEach(p => u.searchParams.delete(p));
    // return clean URL
    return u.toString();
  } catch (e) {
    return originalUrl;
  }
}

export function extractFirstUrlFromText(text) {
  if (!text) return null;
  const urlRegex = /https?:\/\/[\w\-./?=&%]+/i;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}
