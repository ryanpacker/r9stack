import { execa } from "execa";
import { logger } from "./logger.js";

const FLIGHT_RULES_TARBALL =
  "https://github.com/ryanpacker/flight-rules/tarball/main";

/**
 * Install Flight Rules documentation framework in the specified directory.
 * Uses the GitHub tarball since flight-rules is not published to npm.
 */
export async function installFlightRules(projectDir: string): Promise<boolean> {
  try {
    logger.info("Installing Flight Rules documentation framework...");

    await execa("npx", [FLIGHT_RULES_TARBALL, "init", "--yes"], {
      cwd: projectDir,
      stdio: "inherit",
    });

    return true;
  } catch (error) {
    logger.error("Failed to install Flight Rules");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return false;
  }
}
