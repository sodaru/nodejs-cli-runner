import { logError, logNormal, logSuccess } from "./log";

export const taskRunner = async <T extends unknown[], D>(
  name: string,
  task: (...args: T) => Promise<D>,
  verbose: boolean,
  ...args: T
): Promise<D> => {
  const taskName = name;
  if (verbose) {
    logNormal(taskName + " :- Started");
  }
  try {
    const result = await task(...args);
    if (verbose) {
      logSuccess(taskName + " :- Completed");
    }
    return result;
  } catch (e) {
    logError(taskName + " :- Failed");
    throw e;
  }
};
