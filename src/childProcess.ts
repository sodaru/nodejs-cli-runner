import { spawn } from "child_process";

export type ChildProcessResult = {
  stdout?: string;
  stderr?: string;
};

/**
 * @deprecated
 * Retained for backword compatibility
 */
export type CommandResult = ChildProcessResult;

export type ChildProcessStreamConfig = {
  show: "error" | "on" | "off";
  return: "on" | "off";
};

/**
 * @deprecated
 * Retained for backword compatibility
 */
export type StreamConfig = ChildProcessStreamConfig;

export class ChildProcessError extends Error {
  private _result: ChildProcessResult = null;
  private _program: string = null;

  constructor(program: string, result: ChildProcessResult) {
    super(`Child Process Failed. Run : ${program}`);
    this._program = program;
    this._result = result;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get result(): ChildProcessResult {
    return this._result;
  }

  get program(): string {
    return this._program;
  }
}

export const childProcess = (
  dir: string,
  command: string,
  args: string[],
  stdout: ChildProcessStreamConfig = { show: "error", return: "off" },
  stderr: ChildProcessStreamConfig = { show: "error", return: "off" },
  prefix?: string
): Promise<ChildProcessResult> => {
  return new Promise((resolve, reject) => {
    const data = {
      stdout: {
        lines: [],
        buffer: ""
      },
      stderr: {
        lines: [],
        buffer: ""
      }
    };

    if (!prefix) {
      prefix = "";
    }

    const handleChunk = (chunk: string, type: "stdout" | "stderr") => {
      data[type].buffer += chunk;
      const lines = data[type].buffer.split("\n");
      data[type].buffer = lines.pop();
      data[type].lines.push(...lines);
      if ((type == "stdout" ? stdout : stderr).show == "on") {
        for (const line of lines) {
          process[type].write(prefix + line + "\n");
        }
      }
    };

    const handleLines = (
      type: "stdout" | "stderr",
      code: number
    ): string | undefined => {
      if (data[type].lines.length > 0) {
        const streamConfig = type == "stdout" ? stdout : stderr;
        if (streamConfig.show == "error" && code != 0) {
          process[type].write(data[type].lines.join("\n"));
        }
        if (streamConfig.return == "on") {
          return data[type].lines.map(line => prefix + line).join("\n");
        }
      }
    };

    const childProcess = spawn(command, args, {
      cwd: dir,
      windowsHide: true,
      stdio: [
        "inherit",
        stdout.show == "on" && stdout.return == "off" && !prefix
          ? "inherit"
          : "pipe",
        stderr.show == "on" && stderr.return == "off" && !prefix
          ? "inherit"
          : "pipe"
      ],
      env: process.env // any update to process.env in the current process are propagated only if specified explicitly
    });
    childProcess.on("error", e => {
      reject(e);
    });
    childProcess.stdout?.on("data", chunk => {
      handleChunk(chunk, "stdout");
    });
    childProcess.stderr?.on("data", chunk => {
      handleChunk(chunk, "stderr");
    });
    childProcess.on("exit", code => {
      const result: ChildProcessResult = {};
      result.stdout = handleLines("stdout", code);
      result.stderr = handleLines("stderr", code);
      if (code == 0) {
        resolve(result);
      } else {
        reject(new ChildProcessError([command, ...args].join(" "), result));
      }
    });
  });
};
