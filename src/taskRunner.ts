import { logError, logNormal, logSuccess } from "./log";

let loaderStep = 0;
const loaderChars = ["|", "/", "-", "\\"];

let loaderCount = 0;

let loaderIntervalId = null;

const activateLoader = () => {
  if (loaderIntervalId == null) {
    if (typeof process.stdout.moveCursor === "function") {
      // when process.stdout is not pointing to a terminal , the possibility of moveCursor function is unknown
      loaderIntervalId = setInterval(() => {
        process.stdout.write(loaderChars[loaderStep++]);
        process.stdout.moveCursor(-1, 0);
        if (loaderStep == 4) {
          loaderStep = 0;
        }
      }, 200);
    }
  }
  loaderCount++;
};

const clearLoader = () => {
  loaderCount--;
  if (loaderCount == 0) {
    clearInterval(loaderIntervalId);
    loaderIntervalId = null;
  }
};

export const taskRunner = async <T extends unknown[], D>(
  name: string,
  task: (...args: T) => Promise<D>,
  options: boolean | { verbose: boolean; progressIndicator: boolean },
  ...args: T
): Promise<D> => {
  const verbose = typeof options == "boolean" ? options : options.verbose;
  const progressIndicator =
    typeof options == "boolean" ? options : options.progressIndicator;
  if (verbose) {
    logNormal(name + " :- Started");
  }
  if (progressIndicator) {
    activateLoader();
  }
  try {
    const result = await task(...args);
    if (verbose) {
      logSuccess(name + " :- Completed");
    }
    return result;
  } catch (e) {
    logError(name + " :- Failed");
    throw e;
  } finally {
    if (progressIndicator) {
      clearLoader();
    }
  }
};
