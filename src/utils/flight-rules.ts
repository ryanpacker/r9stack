import { execa } from "execa";
import { logger } from "./logger.js";

/**
 * Install Flight Rules documentation framework in the specified directory.
 */
export async function installFlightRules(projectDir: string): Promise<boolean> {
  try {
    logger.info("Installing Flight Rules documentation framework...");

    await execa("npx", ["flight-rules@dev", "init", "--yes"], {
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
