import { execa } from "execa";
import { logger } from "./logger.js";

/**
 * Check if the GitHub CLI (gh) is installed and authenticated.
 */
export async function isGhCliInstalled(): Promise<boolean> {
  try {
    await execa("gh", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the GitHub CLI is authenticated.
 */
export async function isGhCliAuthenticated(): Promise<boolean> {
  try {
    const result = await execa("gh", ["auth", "status"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Initialize a git repository in the specified directory.
 */
export async function initGitRepo(projectDir: string): Promise<boolean> {
  try {
    await execa("git", ["init"], { cwd: projectDir });
    await execa("git", ["add", "-A"], { cwd: projectDir });
    await execa("git", ["commit", "-m", "Initial commit from r9stack"], {
      cwd: projectDir,
    });
    return true;
  } catch (error) {
    logger.error("Failed to initialize git repository");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return false;
  }
}

/**
 * Create a GitHub repository and push the initial commit.
 */
export async function createGitHubRepo(
  projectDir: string,
  projectName: string,
  isPrivate: boolean
): Promise<boolean> {
  try {
    const visibility = isPrivate ? "--private" : "--public";

    await execa(
      "gh",
      ["repo", "create", projectName, "--source", ".", visibility, "--push"],
      { cwd: projectDir }
    );

    return true;
  } catch (error) {
    logger.error("Failed to create GitHub repository");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return false;
  }
}

