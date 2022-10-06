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
  let pos = 0;
  const chars = ["|", "/", "-", "\\"];
  const intervalId = setInterval(() => {
    process.stdout.write(chars[pos++] + "\r");
    if (pos == 4) {
      pos = 0;
    }
  }, 200);
  try {
    const result = await task(...args);
    if (verbose) {
      logSuccess(taskName + " :- Completed");
    }
    return result;
  } catch (e) {
    logError(taskName + " :- Failed");
    throw e;
  } finally {
    clearInterval(intervalId);
  }
};
