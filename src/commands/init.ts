import { input, confirm, select } from "@inquirer/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { createTanStackProject } from "../utils/exec.js";
import { logger } from "../utils/logger.js";
import {
  getDefaultTemplate,
  getTemplateById,
  fetchTemplates,
  type Template,
} from "../utils/templates.js";
import { replaceProjectNamePlaceholder } from "../utils/placeholders.js";
import { installFlightRules } from "../utils/flight-rules.js";
import {
  isGhCliInstalled,
  isGhCliAuthenticated,
  initGitRepo,
  createGitHubRepo,
} from "../utils/github.js";

export interface InitOptions {
  template?: string;
  yes?: boolean;
  flightRules?: boolean;
  github?: boolean;
  private?: boolean;
  public?: boolean;
}

export async function initCommand(
  projectName: string | undefined,
  options: InitOptions
): Promise<void> {
  logger.banner("r9stack - Scaffold your SaaS");

  // Fetch the template
  let template: Template;
  try {
    logger.info("Fetching available templates...");

    if (options.template) {
      // User specified a template by ID
      const found = await getTemplateById(options.template);
      if (!found) {
        logger.error(`Template "${options.template}" not found.`);
        logger.blank();
        logger.info("Available templates:");
        const templates = await fetchTemplates();
        for (const t of templates) {
          const shortId = t.id.replace("r9-template-", "");
          console.log(`  ${pc.cyan(shortId)} - ${t.name}`);
        }
        logger.blank();
        process.exit(1);
      }
      template = found;
    } else {
      // Use default template
      template = await getDefaultTemplate();
    }

    logger.blank();
  } catch {
    logger.error("Could not fetch templates. Please check your internet connection.");
    process.exit(1);
  }

  // Show template info
  logger.info(`Using template: ${pc.cyan(template.name)} v${template.version}`);
  logger.info(pc.dim(template.description));
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

  // Create the TanStack Start project with template
  const success = await createTanStackProject(name, template.url);

  if (!success) {
    process.exit(1);
  }

  // Replace project name placeholder in generated files
  replaceProjectNamePlaceholder(targetPath, name);

  logger.blank();
  logger.success("Project created successfully!");
  logger.blank();

  // Track what was installed for next steps
  let flightRulesInstalled = false;
  let gitHubRepoCreated = false;
  let repoVisibility: "private" | "public" = "private";

  // === Flight Rules Installation ===
  // Default: install unless --no-flight-rules was specified
  const shouldInstallFlightRules = options.flightRules !== false;

  if (shouldInstallFlightRules) {
    let doInstall = options.yes; // With --yes, auto-install

    if (!options.yes) {
      doInstall = await confirm({
        message: "Install Flight Rules documentation framework?",
        default: true,
      });
    }

    if (doInstall) {
      flightRulesInstalled = await installFlightRules(targetPath);
      if (flightRulesInstalled) {
        logger.success("Flight Rules installed!");
      }
      logger.blank();
    }
  }

  // === GitHub Repository Creation ===
  // Default: skip with --yes (unless --github is specified)
  // Interactive: prompt the user
  const githubExplicitlyEnabled = options.github === true;
  const githubExplicitlyDisabled = options.github === false;

  let shouldCreateGitHub = false;

  if (githubExplicitlyDisabled) {
    shouldCreateGitHub = false;
  } else if (githubExplicitlyEnabled) {
    shouldCreateGitHub = true;
  } else if (options.yes) {
    // With --yes but no explicit flag, skip GitHub
    shouldCreateGitHub = false;
  } else {
    // Interactive mode: ask the user
    shouldCreateGitHub = await confirm({
      message: "Create a GitHub repository for this project?",
      default: false,
    });
  }

  if (shouldCreateGitHub) {
    // Check if gh CLI is installed
    const ghInstalled = await isGhCliInstalled();
    if (!ghInstalled) {
      logger.warn("GitHub CLI (gh) is not installed.");
      logger.info("Install it from: https://cli.github.com/");
      logger.info("Then run: gh auth login");
      logger.blank();
    } else {
      // Check if authenticated
      const ghAuthenticated = await isGhCliAuthenticated();
      if (!ghAuthenticated) {
        logger.warn("GitHub CLI is not authenticated.");
        logger.info("Run: gh auth login");
        logger.blank();
      } else {
        // Determine visibility
        if (options.public) {
          repoVisibility = "public";
        } else if (options.private) {
          repoVisibility = "private";
        } else if (!options.yes) {
          // Prompt for visibility
          repoVisibility = await select({
            message: "Repository visibility:",
            choices: [
              { name: "Private", value: "private" as const },
              { name: "Public", value: "public" as const },
            ],
            default: "private",
          });
        }

        // Initialize git repo
        logger.info("Initializing git repository...");
        const gitInitialized = await initGitRepo(targetPath);

        if (gitInitialized) {
          logger.info(`Creating ${repoVisibility} GitHub repository...`);
          gitHubRepoCreated = await createGitHubRepo(
            targetPath,
            name,
            repoVisibility === "private"
          );

          if (gitHubRepoCreated) {
            logger.success(`GitHub repository created and pushed!`);
          }
        }
        logger.blank();
      }
    }
  }

  // Next steps (adjusted based on what was installed)
  logger.info("Next steps:");
  logger.blank();

  let stepNumber = 1;

  // Only show cd step if we're not already in the project
  console.log(`  ${pc.cyan(`${stepNumber}.`)} Navigate to your project:`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("cd")} ${name}`);
  logger.blank();
  stepNumber++;

  console.log(`  ${pc.cyan(`${stepNumber}.`)} Set up Convex (real-time database):`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("npx convex dev")}`);
  console.log(`     ${pc.dim("This will create your Convex project and generate types.")}`);
  logger.blank();
  stepNumber++;

  console.log(`  ${pc.cyan(`${stepNumber}.`)} Configure WorkOS authentication:`);
  console.log(`     ${pc.dim("•")} Go to ${pc.underline("https://dashboard.workos.com")}`);
  console.log(`     ${pc.dim("•")} Create a project and copy your API keys`);
  console.log(`     ${pc.dim("•")} Add them to your ${pc.cyan(".env")} file`);
  logger.blank();
  stepNumber++;

  console.log(`  ${pc.cyan(`${stepNumber}.`)} Start the development server:`);
  console.log(`     ${pc.dim("$")} ${pc.cyan("npm run dev")}`);
  logger.blank();

  // Show summary of what was set up
  if (flightRulesInstalled || gitHubRepoCreated) {
    logger.info("Additional setup completed:");
    if (flightRulesInstalled) {
      console.log(`  ${pc.green("✓")} Flight Rules documentation framework`);
    }
    if (gitHubRepoCreated) {
      console.log(`  ${pc.green("✓")} GitHub repository (${repoVisibility})`);
    }
    logger.blank();
  }

  logger.info(`${pc.dim("For more info, see the README.md in your project.")}`);
  logger.blank();
}
