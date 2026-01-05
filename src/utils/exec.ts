import { execa } from "execa";
import { logger } from "./logger.js";

export interface ExecOptions {
  cwd?: string;
  silent?: boolean;
}

/**
 * Execute a command and stream its output to the console.
 * Returns the exit code (0 for success).
 */
export async function execCommand(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<number> {
  const { cwd, silent = false } = options;

  try {
    const subprocess = execa(command, args, {
      cwd,
      stdout: silent ? "pipe" : "inherit",
      stderr: silent ? "pipe" : "inherit",
      stdin: "inherit",
    });

    const result = await subprocess;
    return result.exitCode ?? 0;
  } catch (error) {
    if (error && typeof error === "object" && "exitCode" in error) {
      return (error as { exitCode: number }).exitCode;
    }
    throw error;
  }
}

export interface CreateProjectOptions {
  packageManager?: string;
}

/**
 * Execute npx create command for TanStack Start with a starter.
 */
export async function createTanStackProject(
  projectName: string,
  starterUrl: string,
  options: CreateProjectOptions = {}
): Promise<boolean> {
  const { packageManager = "npm" } = options;

  const args = [
    "@tanstack/create-start@latest",
    projectName,
    "--starter",
    starterUrl,
    "--package-manager",
    packageManager,
    "--no-git",
  ];

  logger.step(1, 1, "Creating r9stack project...");
  logger.blank();

  const exitCode = await execCommand("npx", args);

  if (exitCode !== 0) {
    logger.error("Failed to create project");
    return false;
  }

  return true;
}

