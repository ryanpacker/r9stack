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

/**
 * Execute npm create command for TanStack Start.
 */
export async function createTanStackProject(
  projectName: string,
  targetDir?: string
): Promise<boolean> {
  const args = [
    "create",
    "@tanstack/start@latest",
    projectName,
    "--",
    "--framework",
    "React",
    "--package-manager",
    "npm",
    "--toolchain",
    "eslint",
  ];

  if (targetDir) {
    args.push("--target-dir", targetDir);
  }

  logger.step(1, 1, "Creating TanStack Start project...");
  logger.blank();

  const exitCode = await execCommand("npm", args);

  if (exitCode !== 0) {
    logger.error("Failed to create TanStack Start project");
    return false;
  }

  return true;
}

