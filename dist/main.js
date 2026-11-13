"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const index_1 = require("./middleware/index");
const config_js_1 = require("./config.js");
const connection_db_js_1 = require("./DB/connection.db.js");
const index_js_1 = require("./modules/user/index.js");
const cors_1 = __importDefault(require("cors"));
const user_repository_js_1 = require("./common/repository/user.repository.js");
const app = (0, express_1.default)();
(0, connection_db_js_1.bootstrapDB)(app, config_js_1.PORT);
app.use('/assets', express_1.default.static('./assets'));
app.use((0, cors_1.default)(), express_1.default.json());
app.use('/auth', modules_1.authenticationController);
app.use('/user', index_js_1.userController);
app.all('/', (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.all('/ayHaga', async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use(index_1.globalErrorHandling);
async function test() {
    const userModel = new user_repository_js_1.UserRepository();
    const user = await userModel.insertMany({
        data: [{
                firstName: "yous",
                lastName: "mounir",
                email: `${Date.now()}@gamil.com`,
                password: "shssjjs",
                phone: "0122222293939"
            }]
    });
    console.log(user);
}
test();
