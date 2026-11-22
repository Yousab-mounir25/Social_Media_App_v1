"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestRepository = void 0;
const friendRequest_model_js_1 = require("../../DB/model/friendRequest.model.js");
const base_repository_js_1 = require("./base.repository.js");
class FriendRequestRepository extends base_repository_js_1.DatabaseRepository {
    constructor() {
        super(friendRequest_model_js_1.FriendRequestModel);
    }
}
exports.FriendRequestRepository = FriendRequestRepository;
