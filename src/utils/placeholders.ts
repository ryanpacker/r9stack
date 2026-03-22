import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./logger.js";

const PROJECT_NAME_PLACEHOLDER = "__PROJECT_NAME__";

/**
 * Recursively find all files in a directory.
 */
function getAllFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry !== "node_modules" && !entry.startsWith(".")) {
        getAllFiles(fullPath, files);
      }
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Convert a project name (kebab-case) to a display name (Title Case).
 * Examples:
 *   my-awesome-project -> My Awesome Project
 *   test-app -> Test App
 */
export function toDisplayName(projectName: string): string {
  return projectName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Replace placeholder strings in all files within a project directory.
 */
export function replaceProjectNamePlaceholder(
  projectDir: string,
  projectName: string
): void {
  const displayName = toDisplayName(projectName);
  const files = getAllFiles(projectDir);

  let replacedCount = 0;

  for (const file of files) {
    // Only process text files
    const ext = file.split(".").pop()?.toLowerCase();
    const textExtensions = [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "html",
      "css",
      "md",
      "txt",
    ];

    if (!ext || !textExtensions.includes(ext)) {
      continue;
    }

    try {
      const content = readFileSync(file, "utf-8");

      if (content.includes(PROJECT_NAME_PLACEHOLDER)) {
        const newContent = content.replaceAll(
          PROJECT_NAME_PLACEHOLDER,
          displayName
        );
        writeFileSync(file, newContent, "utf-8");
        replacedCount++;
      }
    } catch {
      // Skip files that can't be read (binary, etc.)
    }
  }

  if (replacedCount > 0) {
    logger.info(`Customized ${replacedCount} file(s) with project name`);
  }
}

