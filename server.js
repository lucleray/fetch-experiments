"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
(0, http_1.createServer)(function (req, res) {
    console.log('received request');
    res.end('hello');
}).listen(3000);
