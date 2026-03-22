#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import { initCommand } from "./commands/init.js";
import { fetchTemplates } from "./utils/templates.js";
import { logger } from "./utils/logger.js";

const program = new Command();

program
  .name("r9stack")
  .description("CLI tool that scaffolds opinionated SaaS projects")
  .version("0.4.0");

// Template list option
program
  .option("--template-list", "List available templates")
  .hook("preAction", async (thisCommand) => {
    if (thisCommand.opts().templateList) {
      await listTemplates();
      process.exit(0);
    }
  });

program
  .command("init [project-name]")
  .description("Scaffold a new r9stack project")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("-t, --template <id>", "Use a specific template (e.g., 'standard')")
  .option("--no-flight-rules", "Skip Flight Rules installation")
  .option("--github", "Create GitHub repository")
  .option("--no-github", "Skip GitHub repository creation")
  .option("--private", "Make GitHub repository private (default)")
  .option("--public", "Make GitHub repository public")
  .action(initCommand);

// Make init the default command when no command is specified
program.action(async (options) => {
  if (options.templateList) {
    // Already handled by hook
    return;
  }
  await initCommand(undefined, {});
});

async function listTemplates(): Promise<void> {
  logger.banner("r9stack - Available Templates");

  try {
    const templates = await fetchTemplates();

    if (templates.length === 0) {
      logger.info("No templates available.");
      return;
    }

    for (const template of templates) {
      console.log();
      console.log(`  ${pc.cyan(template.name)} ${pc.dim(`v${template.version}`)}`);
      console.log(`  ${pc.dim(template.description)}`);
      console.log(`  ${pc.dim("ID:")} ${template.id}`);
    }

    console.log();
    logger.info("Create a project with:");
    console.log(`  ${pc.dim("$")} ${pc.cyan("npx r9stack init my-project")}`);
    console.log();
  } catch {
    logger.error("Failed to fetch templates. Please check your internet connection.");
    process.exit(1);
  }
}

program.parse();
