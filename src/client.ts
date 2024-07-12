import { Worker, isMainThread, parentPort } from "worker_threads";

async function cpuPromise(loop: number = 1000) {
  return new Promise<void>((resolve) => {
    for (let j = 0; j < loop; j++) {
      JSON.stringify({ x: Math.random() });
    }
    resolve();
  });
}

async function fetchPromise() {
  try {
    await fetch("http://localhost:3000");
  } catch (error) {
    console.log("fetch error", error.cause.code);
  }
}

async function fakeDrainRequest() {
  await fetchPromise();
  await cpuPromise(1000);
}

async function time<T>(label: string, fn: () => Promise<T>) {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const end = Date.now();
    console.log(`${label} took ${end - start}ms`);
  }
}

async function main() {
  const promises: Promise<void>[] = [];

  // make fetch requests in worker
  const worker = new Worker(__filename);
  const fetchResolvers: (() => void)[] = [];
  worker.on("message", ({ message, id }) => {
    if (message === "done") {
      const resolver = fetchResolvers[id];
      if (resolver) {
        resolver();
      } else {
        console.log("error resolving ", id);
      }
    }
  });

  for (let i = 0; i < 200; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        worker.postMessage({ message: "fetch", id: i });
        fetchResolvers.push(resolve);
      })
    );
  }

  for (let i = 0; i < 200; i++) {
    promises.push(cpuPromise(50000));
  }

  await Promise.all(promises);

  worker.terminate();
}

async function worker() {
  parentPort?.on("message", ({ message, id }) => {
    if (message === "fetch") {
      fetchPromise().then(() => {
        parentPort?.postMessage({ message: "done", id });
      });
    }
  });
}

if (isMainThread) {
  time("main", main).catch(console.error);
} else {
  worker();
}
