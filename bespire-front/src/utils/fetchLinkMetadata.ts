import axios from "axios";

interface LinkMetadata {
  title: string;
  favicon: string;
  description: string;
  url: string;
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata | null> {
  try {
    const { data } = await axios.get(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    if (data.status === "success") {
      return {
        title: data.data.title,
        favicon: data.data.logo?.url || `${new URL(url).origin}/favicon.ico`,
        description: data.data.description,
        url: data.data.url,
      };
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch link metadata:", err);
    return null;
  }
}