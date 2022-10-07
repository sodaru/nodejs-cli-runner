/* eslint-disable */
const { createInterface } = require("readline");
const { taskRunner } = require("../dist/cjs/taskRunner");

const job1 = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

const job2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Job2 Failure");
    }, 5000);
  });
};

const job3 = () => {
  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      console.log("Job3 Log");
    }, 1000);
    setTimeout(() => {
      clearInterval(intervalId);
      resolve();
    }, 5000);
  });
};

const job4 = () => {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("Job4: What is your name ?", ans => {
      console.log(ans);
      rl.close();
      resolve();
    });
  });
};

const runAllInSequence = async () => {
  await taskRunner("JOB1", job1, { verbose: false, progressIndicator: true });
  try {
    await taskRunner("JOB2", job2, { verbose: false, progressIndicator: true });
  } catch (e) {
    // nullify error
  }
  await taskRunner("JOB3", job3, { verbose: false, progressIndicator: true });
  await taskRunner("JOB4", job4, { verbose: false, progressIndicator: false });
};

const runAllInParallel = () => {
  return Promise.allSettled([
    taskRunner("JOB1", job1),
    taskRunner("JOB2", job2),
    taskRunner("JOB3", job3)
    // taskRunner("JOB4", job4) since this has prompt, its not correct to run in parallel
  ]);
};

const runAllInParallelWithVerbose = () => {
  return Promise.allSettled([
    taskRunner("JOB1", job1, true),
    taskRunner("JOB2", job2, true),
    taskRunner("JOB3", job3, true)
    // taskRunner("JOB4", job4, true) ince this has prompt, its not correct to run in parallel
  ]);
};

const run = async () => {
  console.log("SEQUENCE :- ");
  await runAllInSequence();

  console.log("");
  console.log("");
  console.log("PARALLEL :- ");
  await runAllInParallel();

  console.log("");
  console.log("");
  console.log("VERBOSE :- ");
  await runAllInParallelWithVerbose();
};

run().then(
  () => {
    console.log("DONE");
  },
  r => {
    console.error(r);
    process.exit(1);
  }
);
