import { startTransition } from "react";
import type { Schema } from "../../data/resource";

const GIPHY_API_KEY = "zHw8IpC7CFf6K7pj27cW0FfbSqEqFgKY";
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

export const handler: Schema["fetchGifs"]["functionHandler"] = async (
  event
) => {
  try {
    const start = performance.now();
    const response = await fetch(
      `${GIPHY_SEARCH_URL}?api_key=${GIPHY_API_KEY}&q=${event.arguments.query}&limit=10`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("response", response);

    const dataString = await response.json();
    console.log("dataString", dataString);
    const gifList = dataString.data;
    console.log("gifList", gifList);
    const output = gifList.map((gif: any) => ({
      id: gif.id,
      url: gif.images.fixed_width_small.url,
      title: gif.title,
    }));
    console.log("output", output);
    return output;
  } catch (error) {
    console.error("Error fetching GIFs:", error);
    throw error;
  }
};
