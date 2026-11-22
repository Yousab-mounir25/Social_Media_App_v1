"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const firebase_admin_1 = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const cache_services_js_1 = require("./cache.services.js");
class NotificationService {
    client;
    cahceService;
    constructor() {
        this.cahceService = cache_services_js_1.cacheService;
        this.client = (0, firebase_admin_1.initializeApp)({
            credential: (0, firebase_admin_1.cert)(JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)('./src/config/socialmediaapp-7c71f-firebase-adminsdk-fbsvc-e83cd3859f.json'))))
        });
    }
    key({ userId }) {
        return `User:FCM:${userId.toString()}`;
    }
    async addFCM({ userId, FCM }) {
        return this.cahceService.sAdd({ key: this.key({ userId }), value: FCM });
    }
    async removeFCM({ userId, FCM }) {
        return this.cahceService.sRem({ key: this.key({ userId }), value: FCM });
    }
    async getFCM({ userId }) {
        return this.cahceService.sMembers({ key: this.key({ userId }) });
    }
    async hasFCM({ userId }) {
        return this.cahceService.sCard({ key: this.key({ userId }) });
    }
    async removeFCMUser({ userId }) {
        return this.cahceService.del({ key: this.key({ userId }) });
    }
    async sendNotification({ token, notification }) {
        return await (0, messaging_1.getMessaging)(this.client).send({
            token,
            notification
        });
    }
    async sendNotifications({ tokens, notification }) {
        return await Promise.allSettled(tokens.map(token => this.sendNotification({ token, notification })));
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
