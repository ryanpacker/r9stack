#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import { initCommand } from "./commands/init.js";
import { fetchStarters } from "./utils/starters.js";
import { logger } from "./utils/logger.js";

const program = new Command();

program
  .name("r9stack")
  .description("CLI tool that scaffolds opinionated SaaS projects")
  .version("0.4.0");

// Starter list option
program
  .option("--starter-list", "List available starters")
  .hook("preAction", async (thisCommand) => {
    if (thisCommand.opts().starterList) {
      await listStarters();
      process.exit(0);
    }
  });

program
  .command("init [project-name]")
  .description("Scaffold a new r9stack project")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("-s, --starter <id>", "Use a specific starter (e.g., 'standard')")
  .option("--no-flight-rules", "Skip Flight Rules installation")
  .option("--github", "Create GitHub repository")
  .option("--no-github", "Skip GitHub repository creation")
  .option("--private", "Make GitHub repository private (default)")
  .option("--public", "Make GitHub repository public")
  .action(initCommand);

// Make init the default command when no command is specified
program.action(async (options) => {
  if (options.starterList) {
    // Already handled by hook
    return;
  }
  await initCommand(undefined, {});
});

async function listStarters(): Promise<void> {
  logger.banner("r9stack - Available Starters");

  try {
    const starters = await fetchStarters();

    if (starters.length === 0) {
      logger.info("No starters available.");
      return;
    }

    for (const starter of starters) {
      console.log();
      console.log(`  ${pc.cyan(starter.name)} ${pc.dim(`v${starter.version}`)}`);
      console.log(`  ${pc.dim(starter.description)}`);
      console.log(`  ${pc.dim("ID:")} ${starter.id}`);
    }

    console.log();
    logger.info("Create a project with:");
    console.log(`  ${pc.dim("$")} ${pc.cyan("npx r9stack init my-project")}`);
    console.log();
  } catch {
    logger.error("Failed to fetch starters. Please check your internet connection.");
    process.exit(1);
  }
}

program.parse();
