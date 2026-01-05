import { input, confirm } from "@inquirer/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { createTanStackProject } from "../utils/exec.js";
import { logger } from "../utils/logger.js";
import {
  getDefaultStarter,
  getStarterById,
  fetchStarters,
  type Starter,
} from "../utils/starters.js";
import { replaceProjectNamePlaceholder } from "../utils/templates.js";

export interface InitOptions {
  starter?: string;
  yes?: boolean;
}

export async function initCommand(
  projectName: string | undefined,
  options: InitOptions
): Promise<void> {
  logger.banner("r9stack - Scaffold your SaaS");

  // Fetch the starter
  let starter: Starter;
  try {
    logger.info("Fetching available starters...");

    if (options.starter) {
      // User specified a starter by ID
      const found = await getStarterById(options.starter);
      if (!found) {
        logger.error(`Starter "${options.starter}" not found.`);
        logger.blank();
        logger.info("Available starters:");
        const starters = await fetchStarters();
        for (const s of starters) {
          const shortId = s.id.replace("r9-starter-", "");
          console.log(`  ${pc.cyan(shortId)} - ${s.name}`);
        }
        logger.blank();
        process.exit(1);
      }
      starter = found;
    } else {
      // Use default starter
      starter = await getDefaultStarter();
    }

    logger.blank();
  } catch {
    logger.error("Could not fetch starters. Please check your internet connection.");
    process.exit(1);
  }

  // Show starter info
  logger.info(`Using starter: ${pc.cyan(starter.name)} v${starter.version}`);
  logger.info(pc.dim(starter.description));
  logger.blank();

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
    if (options.yes) {
      logger.warn(`Directory ${pc.yellow(name)} already exists. Continuing...`);
    } else {
      const proceed = await confirm({
        message: `Directory ${pc.yellow(name)} already exists. Continue anyway?`,
        default: false,
      });

      if (!proceed) {
        logger.info("Aborted.");
        return;
      }
    }
  }

  // Confirm before proceeding
  logger.blank();
  logger.info(`Project: ${pc.cyan(name)}`);
  logger.info(`Location: ${pc.cyan(targetPath)}`);
  logger.blank();

  if (!options.yes) {
    const confirmed = await confirm({
      message: "Create project with these settings?",
      default: true,
    });

    if (!confirmed) {
      logger.info("Aborted.");
      return;
    }
  }

  logger.blank();

  // Create the TanStack Start project with starter
  const success = await createTanStackProject(name, starter.url);

  if (!success) {
    process.exit(1);
  }

  // Replace project name placeholder in generated files
  replaceProjectNamePlaceholder(targetPath, name);

  // Success message with next steps
  logger.blank();
  logger.success("Project created successfully!");
  logger.blank();

  // Next steps
  logger.info("Next steps:");
  logger.blank();

  console.log(`  ${pc.cyan("1.")} Navigate to your project:`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("cd")} ${name}`);
  logger.blank();

  console.log(`  ${pc.cyan("2.")} Set up Convex (real-time database):`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("npx convex dev")}`);
  console.log(`     ${pc.dim("This will create your Convex project and generate types.")}`);
  logger.blank();

  console.log(`  ${pc.cyan("3.")} Configure WorkOS authentication:`);
  console.log(`     ${pc.dim("•")} Go to ${pc.underline("https://dashboard.workos.com")}`);
  console.log(`     ${pc.dim("•")} Create a project and copy your API keys`);
  console.log(`     ${pc.dim("•")} Add them to your ${pc.cyan(".env")} file`);
  logger.blank();

  console.log(`  ${pc.cyan("4.")} Start the development server:`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("npm run dev")}`);
  logger.blank();

  logger.info(`${pc.dim("For more info, see the README.md in your project.")}`);
  logger.blank();
}
