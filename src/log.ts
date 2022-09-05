import chalk from "chalk";

export const logError = (str: string): void => {
  // eslint-disable-next-line no-console
  console.error(chalk.red(str));
};

export const logSuccess = (str: string): void => {
  // eslint-disable-next-line no-console
  console.log(chalk.green(str));
};

export const logNormal = (str: string): void => {
  // eslint-disable-next-line no-console
  console.log(str);
};

export const logWarning = (str: string): void => {
  // eslint-disable-next-line no-console
  console.warn(chalk.yellow(str));
};

export const logInfo = (str: string): void => {
  // eslint-disable-next-line no-console
  console.info(chalk.cyan(str));
};
