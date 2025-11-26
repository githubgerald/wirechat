/**
 * Giphy Integration Utilities
 * Handles searching, displaying, and sending GIFs
 */

const GIPHY_API_KEY = "AYPLoWDr3kEAp9wA4YacrZCWFDY0pjy3";

/**
 * Search Giphy API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of GIF objects
 */
export async function searchGiphy(query) {
  if (!query || query.trim() === "") {
    return [];
  }

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
    query
  )}&limit=42&rating=g`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("❌ Error searching Giphy:", error);
    return [];
  }
}

/**
 * Format search results for display
 * @param {Array} gifs - Array of GIF objects from Giphy API
 * @returns {Array} Formatted array with URLs and metadata
 */
export function formatGiphyResults(gifs) {
  return gifs.map((gif) => ({
    id: gif.id,
    title: gif.title,
    thumbUrl: gif.images.fixed_height_small.url,
    originalUrl: gif.images.original.url,
    gif: gif,
  }));
}

/**
 * Create a message object for a GIF
 * @param {string} gifUrl - Original GIF URL
 * @param {string} title - GIF title
 * @param {string} username - Username of sender
 * @returns {Object} Message data object
 */
export function createGiphyMessage(gifUrl, title, username) {
  return {
    username: username || "User",
    userType: "user",
    /**message: title || "Sent a GIF",**/
    mediaType: "image",
    mediaUrl: gifUrl,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: new Date().toLocaleDateString(),
  };
}
