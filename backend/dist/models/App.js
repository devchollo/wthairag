"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FieldSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ["text", "textarea", "radio", "checkbox", "message", "submit", "email", "phone", "number", "list", "date"],
        required: true,
    },
    label: { type: String },
    required: { type: Boolean, default: false },
    isSecret: { type: Boolean, default: false },
    options: [
        {
            label: { type: String },
            value: { type: String },
        },
    ],
    messageHtml: { type: String },
    submitText: { type: String },
}, { _id: false });
const AppSchema = new mongoose_1.Schema({
    workspaceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    tag: {
        type: String,
        enum: ["generator", "form"],
        default: "generator",
    },
    launchMode: {
        type: String,
        enum: ["modal", "new_tab"],
        default: "modal",
    },
    enabled: { type: Boolean, default: true },
    allowAiImprove: { type: Boolean, default: false },
    layout: {
        header: {
            logoUrl: String,
            logoKey: String,
            title: String,
            subtitle: String,
        },
        background: {
            type: {
                type: String,
                enum: ["solid", "gradient", "image"],
                default: "solid",
            },
            value: { type: String, default: "#ffffff" },
            imageKey: String,
        },
    },
    fields: [FieldSchema],
}, { timestamps: true });
exports.default = mongoose_1.default.model("App", AppSchema);
