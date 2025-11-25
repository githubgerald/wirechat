/* Utilities for parsing and sanitizing common link embeds (YouTube focus)
 */

export function getYouTubeId(url) {
  if (!url) return null;
  try {
    // Normalize URL - handle both http and https
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    
    // youtu.be short link
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('?')[0]; // Remove query params
    }
    
    // youtube.com and www.youtube.com
    if (u.hostname === 'youtube.com' || u.hostname === 'www.youtube.com' || u.hostname.endsWith('.youtube.com')) {
      // common param v
      const v = u.searchParams.get('v');
      if (v) return v;
      
      // /embed/VIDEOID
      const parts = u.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1].split('?')[0]; // Remove query params
      }
      
      // /watch?v=VIDEOID
      if (u.pathname === '/watch' && u.searchParams.get('v')) {
        return u.searchParams.get('v');
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

export function makeYouTubeEmbedUrl(originalUrl) {
  if (!originalUrl) return null;
  
  try {
    let urlCandidate = originalUrl;
    
    // If it's not a valid URL, try to extract one
    try {
      new URL(originalUrl);
    } catch (e) {
      const extracted = extractFirstUrlFromText(originalUrl);
      if (extracted) urlCandidate = extracted;
    }

    const id = getYouTubeId(urlCandidate);
    if (!id) return null;
    
    // Use privacy-enhanced domain and add parameters for better UX
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
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
