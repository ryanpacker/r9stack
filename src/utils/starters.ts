import { logger } from "./logger.js";

const STARTERS_URL =
  "https://raw.githubusercontent.com/ryanpacker/r9stack/main/starters/starters.json";

export interface Starter {
  id: string;
  name: string;
  description: string;
  version: string;
  url: string;
}

interface StartersIndex {
  starters: Starter[];
}

/**
 * Fetch the list of available starters from GitHub.
 */
export async function fetchStarters(): Promise<Starter[]> {
  try {
    const response = await fetch(STARTERS_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as StartersIndex;

    if (!data.starters || !Array.isArray(data.starters)) {
      throw new Error("Invalid starters index format");
    }

    return data.starters;
  } catch (error) {
    logger.error("Failed to fetch starters list");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}

/**
 * Get the default starter (first in the list).
 */
export async function getDefaultStarter(): Promise<Starter> {
  const starters = await fetchStarters();

  if (starters.length === 0) {
    throw new Error("No starters available");
  }

  return starters[0];
}

/**
 * Find a starter by its ID.
 */
export async function getStarterById(id: string): Promise<Starter | undefined> {
  const starters = await fetchStarters();
  return starters.find((s) => s.id === id || s.id.endsWith(`-${id}`));
}

