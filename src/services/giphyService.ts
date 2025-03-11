const GIPHY_API_KEY = "zHw8IpC7CFf6K7pj27cW0FfbSqEqFgKY";
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

export const fetchGifs = async (query: string) => {
  try {
    const response = await fetch(
      `${GIPHY_SEARCH_URL}?api_key=${GIPHY_API_KEY}&q=${query}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; 
  } catch (error) {
    console.error("Error fetching GIFs:", error);
    return [];
  }
};