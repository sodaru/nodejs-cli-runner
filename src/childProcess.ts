import { spawn } from "child_process";
import { PassThrough, Readable, Transform, Writable } from "stream";

class StreamPrefixer extends Transform {
  private prefix = "";
  private lineSeparator = "";
  private firstChunkProcessed = false;

  constructor(prefix: string) {
    super();
    this.prefix = prefix;
    this.lineSeparator = process.platform === "win32" ? "\r\n" : "\n";
  }

  _transform(chunk: Uint8Array, encoding: string, cb: () => void) {
    if (!this.firstChunkProcessed) {
      this.push(this.prefix);
      this.firstChunkProcessed = true;
    }
    const data = String(chunk);
    const lines = data.split(this.lineSeparator);

    this.push(lines.join(this.lineSeparator + this.prefix));

    cb();
  }
}

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
  show?: "error" | "on" | "off";
  return?: "on" | "off";
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

const streamHandler = (
  readableStream: Readable,
  writableStream: Writable,
  config: Required<ChildProcessStreamConfig>,
  prefix?: string
) => {
  const chunks = [];
  if (config.return == "on" || config.show == "error") {
    const datasaver = new PassThrough();

    datasaver.on("data", chunk => {
      chunks.push(chunk);
    });
    readableStream = readableStream.pipe(datasaver);
  }
  if (config.show == "on") {
    if (prefix) {
      readableStream = readableStream.pipe(new StreamPrefixer(prefix));
    }
    readableStream.pipe(writableStream);
  }
  return chunks;
};

export const childProcess = (
  dir: string,
  command: string,
  args: string[],
  stdout: ChildProcessStreamConfig = {},
  stderr: ChildProcessStreamConfig = {},
  prefix?: string
): Promise<ChildProcessResult> => {
  const _stdout = {
    return: stdout.return || "off",
    show: stdout.show || "error"
  };

  const _stderr = {
    return: stderr.return || "off",
    show: stderr.show || "error"
  };

  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: dir,
      windowsHide: true,
      env: process.env // any update to process.env in the current process are propagated only if specified explicitly
    });

    process.stdin.pipe(childProcess.stdin);

    const chunks = {
      stdout: streamHandler(
        childProcess.stdout,
        process.stdout,
        _stdout,
        prefix
      ),
      stderr: streamHandler(
        childProcess.stderr,
        process.stderr,
        _stderr,
        prefix
      )
    };

    childProcess.on("error", e => {
      reject(e);
    });

    childProcess.on("exit", code => {
      const result: ChildProcessResult = {};

      const stdoutStr = Buffer.concat(chunks.stdout).toString();
      const stderrStr = Buffer.concat(chunks.stderr).toString();

      result.stdout = _stdout.return == "on" ? stdoutStr : undefined;
      result.stderr = _stderr.return == "on" ? stderrStr : undefined;
      if (code == 0) {
        resolve(result);
      } else {
        if (_stdout.show == "error" && stdoutStr) {
          streamHandler(
            Readable.from(stdoutStr),
            process.stdout,
            { return: "off", show: "on" },
            prefix
          );
        }
        if (_stderr.show == "error" && stderrStr) {
          streamHandler(
            Readable.from(stderrStr),
            process.stderr,
            { return: "off", show: "on" },
            prefix
          );
        }
        reject(new ChildProcessError([command, ...args].join(" "), result));
      }
    });
  });
};
