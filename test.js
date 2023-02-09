/* eslint-disable */
const { spawn } = require("child_process");
const { PassThrough, Transform } = require("stream");

const sp = spawn("node", ["-e", "console.error('MockError')"]);

class MyTransform extends Transform {
  lastline = "";
  prefix = "";

  constructor(prefix) {
    super();
    this.prefix = prefix;
  }

  _transform(chunk, encoding, cb) {
    const data = this.lastline + String(chunk);
    const lines = data.split("\n");
    this.lastline = lines.pop();

    for (const line of lines) {
      console.log(line);
      this.push(this.prefix + line + "\n");
    }
    cb();
  }

  _flush(cb) {
    console.log(this.lastline);
    if (this.lastline.length > 0) {
      this.push(this.prefix + this.lastline);
    }
    cb();
  }
}

const t1 = new MyTransform("[child]     ");

const tunnel = new PassThrough();

const chunks = [];

tunnel.on("data", data => {
  chunks.push(data);
});

tunnel.on("end", () => {
  console.log(
    "\n\n-------------\n" +
      Buffer.concat(chunks).toString() +
      "\n-------------\n\n"
  );
});

sp.stderr.pipe(tunnel).pipe(process.stderr);
