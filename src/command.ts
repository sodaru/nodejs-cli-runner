import { Command } from "commander";
import { logError, logSuccess, logInfo } from "./log";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { readFile } from "fs/promises";

export const executeCommand = (command: Command, log = false): void => {
  const handleError = (e: Error): void => {
    const message = e instanceof Error ? e.message : e;
    logError(message);
    process.exit(1);
  };

  try {
    command
      .parseAsync()
      .then(() => {
        if (!log) {
          logSuccess("DONE");
        }
      })
      .catch(handleError);
  } catch (e) {
    handleError(e);
  }
};

export type CommonOptions = {
  verbose: boolean;
};

export const addCommonOptions = (command: Command): void => {
  command.option("-v, --verbose", "enable verbose");
};

export type VersionOptions = {
  version: boolean;
};

export const addVersionOptions = (command: Command): void => {
  command.option("--version", `Print version of ${command.name}`);
};

export const getCommandVersion = async (): Promise<string> => {
  let dir = __dirname;
  const packageJson = "package.json";
  while (!existsSync(join(dir, packageJson))) {
    const parentDir = dirname(dir);
    if (parentDir === dir) {
      throw new Error(`Could not find ${packageJson} from '${__dirname}'`);
    }
    dir = parentDir;
  }

  const packageJsonContent = await readFile(join(dir, packageJson), "utf8");

  const packageJsonObj = JSON.parse(packageJsonContent);

  return packageJsonObj.version as string;
};

type RootCommandOptions = {
  version?: boolean;
};

const rootCommandAction = async ({
  version
}: RootCommandOptions): Promise<void> => {
  if (version) {
    logInfo("Version: " + (await getCommandVersion()));
  }
};

export type RootCommandConfig = {
  skipSuccessLog?: boolean;
};

export const rootCommand = (
  name: string,
  subCommands: Command[],
  config: RootCommandConfig = {}
): Command => {
  const command = new Command(name);
  addVersionOptions(command);
  command.action(rootCommandAction);

  subCommands.forEach(subCommand => {
    addCommonOptions(subCommand);
    command.addCommand(subCommand);
  });

  executeCommand(command, !config.skipSuccessLog);

  return command;
};
