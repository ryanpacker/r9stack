#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
  .name("r9stack")
  .description("CLI tool that scaffolds opinionated SaaS projects")
  .version("0.1.0");

program
  .command("init [project-name]")
  .description("Scaffold a new r9stack project")
  .action(initCommand);

// Make init the default command when no command is specified
program.action(async () => {
  await initCommand(undefined, {});
});

program.parse();

