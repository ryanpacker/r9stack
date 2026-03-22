import { logger } from "./logger.js";

const TEMPLATES_URL =
  "https://raw.githubusercontent.com/ryanpacker/r9stack/main/templates/templates.json";

export interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  url: string;
}

interface TemplatesIndex {
  templates: Template[];
}

/**
 * Fetch the list of available templates from GitHub.
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(TEMPLATES_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as TemplatesIndex;

    if (!data.templates || !Array.isArray(data.templates)) {
      throw new Error("Invalid templates index format");
    }

    return data.templates;
  } catch (error) {
    logger.error("Failed to fetch templates list");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}

/**
 * Get the default template (first in the list).
 */
export async function getDefaultTemplate(): Promise<Template> {
  const templates = await fetchTemplates();

  if (templates.length === 0) {
    throw new Error("No templates available");
  }

  return templates[0];
}

/**
 * Find a template by its ID.
 */
export async function getTemplateById(id: string): Promise<Template | undefined> {
  const templates = await fetchTemplates();
  return templates.find((t) => t.id === id || t.id.endsWith(`-${id}`));
}
