import { input, confirm } from "@inquirer/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { createTanStackProject } from "../utils/exec.js";
import { logger } from "../utils/logger.js";

export interface InitOptions {
  // Future options can be added here
}

export async function initCommand(
  projectName: string | undefined,
  _options: InitOptions
): Promise<void> {
  logger.banner("r9stack - Scaffold your SaaS");

  // Prompt for project name if not provided
  const name =
    projectName ||
    (await input({
      message: "What is your project name?",
      default: "my-r9-project",
      validate: (value) => {
        if (!value.trim()) {
          return "Project name is required";
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "Project name must be lowercase alphanumeric with hyphens only";
        }
        return true;
      },
    }));

  const targetPath = resolve(process.cwd(), name);

  // Check if directory exists
  if (existsSync(targetPath)) {
    const proceed = await confirm({
      message: `Directory ${pc.yellow(name)} already exists. Continue anyway?`,
      default: false,
    });

    if (!proceed) {
      logger.info("Aborted.");
      return;
    }
  }

  // Confirm before proceeding
  logger.blank();
  logger.info(`Project: ${pc.cyan(name)}`);
  logger.info(`Location: ${pc.cyan(targetPath)}`);
  logger.blank();

  const confirmed = await confirm({
    message: "Create project with these settings?",
    default: true,
  });

  if (!confirmed) {
    logger.info("Aborted.");
    return;
  }

  logger.blank();

  // Create the TanStack Start project
  const success = await createTanStackProject(name);

  if (!success) {
    process.exit(1);
  }

  // Success message
  logger.blank();
  logger.success("Project created successfully!");
  logger.blank();
  logger.info("Next steps:");
  logger.blank();
  console.log(`  ${pc.cyan("cd")} ${name}`);
  console.log(`  ${pc.cyan("npm run dev")}`);
  logger.blank();
}

