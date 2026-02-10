"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwner = void 0;
const response_1 = require("../utils/response");
const requireOwner = (req, res, next) => {
    if (!req.user || (!req.user.isOwner && !req.user.isAdmin)) {
        return (0, response_1.sendError)(res, 'Owner access required', 403);
    }
    next();
};
exports.requireOwner = requireOwner;
