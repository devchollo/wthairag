"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return (0, response_1.sendError)(res, 'Not authorized to access this route', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Not authorized to access this route', 401);
    }
};
exports.protect = protect;
