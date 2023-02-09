/* eslint-disable */
const { childProcess } = require("../dist/cjs/childProcess");
const chalk = require("chalk");

async function run() {
  console.log(chalk.cyan("\n Simple >"));
  console.log(chalk.cyan("----------"));
  await childProcess(__dirname, "ls", []);

  console.log(chalk.cyan("\n Show Stdout >"));
  console.log(chalk.cyan("--------------"));
  await childProcess(__dirname, "ls", [], { show: "on" });

  console.log(chalk.cyan("\n Show Stderr >"));
  console.log(chalk.cyan("--------------"));
  await childProcess(
    __dirname,
    "node",
    ["-e", "console.error('Mock Error')"],
    undefined,
    {
      show: "on"
    }
  );

  console.log(chalk.cyan("\n Show Stdout with prefix >"));
  console.log(chalk.cyan("---------------------------"));
  await childProcess(
    __dirname,
    "ls",
    [],
    { show: "on" },
    undefined,
    "[prefix] "
  );

  console.log(chalk.cyan("\n Show Stderr with colored prefix>"));
  console.log(chalk.cyan("----------------------------------"));
  await childProcess(
    __dirname,
    "node",
    ["-e", "console.error('Mock Error\\nIn Multiple \\nlines')"],
    undefined,
    { show: "on" },
    chalk.red("[prefix] ")
  );

  // WITH RETURN VALUES

  console.log(chalk.magenta("\n Simple With Return >"));
  console.log(chalk.magenta("---------------------"));
  console.log(
    await childProcess(__dirname, "ls", [], { return: "on" }, { return: "on" })
  );

  console.log(chalk.magenta("\n Show Stdout with Return >"));
  console.log(chalk.magenta("---------------------------"));
  console.log(
    await childProcess(
      __dirname,
      "ls",
      [],
      { show: "on", return: "on" },
      { return: "on" }
    )
  );

  console.log(chalk.magenta("\n Show Stderr with Return >"));
  console.log(chalk.magenta("---------------------------"));
  console.log(
    await childProcess(
      __dirname,
      "node",
      ["-e", "console.error('Mock Error')"],
      { return: "on" },
      { show: "on", return: "on" }
    )
  );

  console.log(chalk.magenta("\n Show Stdout with prefix with Return >"));
  console.log(chalk.magenta("---------------------------------------"));
  console.log(
    await childProcess(
      __dirname,
      "ls",
      [],
      { show: "on", return: "on" },
      { return: "on" },
      "[prefix] "
    )
  );

  console.log(
    chalk.magenta("\n Show Stderr with colored prefix with Return >")
  );
  console.log(chalk.magenta("-----------------------------------------------"));
  console.log(
    await childProcess(
      __dirname,
      "node",
      ["-e", "console.error('Mock Error\\nIn multiple\\nLines')"],
      { return: "on" },
      { show: "on", return: "on" },
      chalk.red("[prefix] ")
    )
  );

  console.log(
    chalk.yellow("\n Show Stdout and Stderr with colored prefix with Return >")
  );
  console.log(chalk.yellow("-----------------------------------------------"));
  console.log(
    await childProcess(
      __dirname,
      "node",
      [
        "-e",
        "console.log('Mock \\nOutput in \\nmuliple lines');console.error('Mock Error\\nIn multiple\\nLines')"
      ],
      { show: "on", return: "on" },
      { show: "on", return: "on" },
      chalk.red("[prefix] ")
    )
  );

  console.log(
    chalk.yellow(
      "\n Show Stdout and Stderr with colored prefix with Return when process exist with code > 0>"
    )
  );
  console.log(chalk.yellow("-----------------------------------------------"));
  try {
    await childProcess(
      __dirname,
      "node",
      [
        "-e",
        "console.log('Mock \\nOutput in \\nmuliple lines');console.error('Mock Error\\nIn multiple\\nLines'); process.exitCode = 1"
      ],
      { show: "on", return: "on" },
      { show: "on", return: "on" },
      chalk.red("[prefix] ")
    );
  } catch (e) {
    console.log("Thrown Error");
    console.log("message : " + e.message);
    console.log("result : " + JSON.stringify(e.result, null, 2));
  }
}

run().then(
  () => {
    console.log(chalk.green("\n--------------\n     DONE    \n--------------"));
  },
  r => {
    console.error(r);
    process.exit(1);
  }
);
