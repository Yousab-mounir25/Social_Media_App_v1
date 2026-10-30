"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const config_js_1 = require("../config.js");
exports.client = (0, redis_1.createClient)({
    url: config_js_1.REDIS_URI
});
async function connectRedis() {
    try {
        await exports.client.connect();
        console.log(`Redis connection established successfully`);
    }
    catch (error) {
        console.log("fail to establish Redis connection");
    }
}
