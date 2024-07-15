async function cpuPromise(loop: number = 1000) {
  return new Promise<void>((resolve) => {
    for (let j = 0; j < loop; j++) {
      JSON.stringify({ x: Math.random() });
    }
    resolve();
  });
}

async function fetchPromise() {
  await fetch("http://localhost:3000");
}

async function fakeDrainRequest() {
  try {
    await fetchPromise();
  } catch (error) {
    console.log("fetch error", error.cause ? error.cause.code : error.message);
  }
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

  for (let i = 0; i < 200; i++) {
    promises.push(fakeDrainRequest());
  }

  for (let i = 0; i < 200; i++) {
    promises.push(cpuPromise(10000));
  }

  await Promise.all(promises);
}

time("main", main).catch(console.error);
