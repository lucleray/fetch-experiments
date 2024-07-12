import { createServer } from "http";

createServer((req, res) => {
  console.log("received request");

  setTimeout(() => {
    res.end("hello");
  }, 300 + Math.random() * 100);
}).listen(3000);
