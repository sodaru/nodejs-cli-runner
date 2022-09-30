# Nodejs CLI Runner

CLI Task Run Utilities for NodeJs

## Install

```
npm i nodejs-cli-runner
```

## Configure set of Sub Commands

Read and write common file types with cached storage

```typescript
import { rootCommand } from "nodejs-cli-runner";

const program = rootCommand("cmd-name", [
  // set of sub commands
]);

export default program;
```

## To run a task within the command action

```typescript
import { taskRunner } from "nodejs-cli-runner";

await taskRunner(
  taskName, // taskname
  task, // function returning a Promise
  verbose, // boolean to print more verbose logs
  taskArgs // arguments to task function
);
```

## Run a child Process

```typescript
import { childProcess } from "nodejs-cli-runner";

await childProcess(
  dir, // dir to run child process on
  command, // command/ program to execute
  args, // program arguments
  stdout // stdout config,
  stderr: // stderr config,
  prefix?: // prefix string to prefix in all stdout and stderr lines
);
```

## Support

This project is a part of the Open Source Initiative from [Sodaru Technologies](https://sodaru.com)

Write an email to opensource@sodaru.com for queries on this project
