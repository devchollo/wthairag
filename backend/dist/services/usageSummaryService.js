"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUsageSummaryForView = exports.recordUsageSummaryForQuery = void 0;
const UsageSummary_1 = __importDefault(require("../models/UsageSummary"));
const normalizeQuery = (query) => query.trim().toLowerCase();
const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const updateSummaryForQuery = async ({ workspaceId, userId, tokens, inputTokens, outputTokens, query, citedDocuments }) => {
    const normalizedQuery = normalizeQuery(query);
    const now = new Date();
    const dateKey = getDateKey(now);
    const summary = await UsageSummary_1.default.findOneAndUpdate({ workspaceId, userId }, {
        $setOnInsert: { workspaceId, userId },
        $inc: {
            totalTokens: tokens,
            totalQueries: 1,
            [`dailyTokens.${dateKey}`]: tokens
        },
        $set: {
            lastViewed: {
                type: 'query',
                title: query,
                updatedAt: now
            }
        }
    }, { upsert: true, new: true });
    if (!summary) {
        return;
    }
    const existing = summary.topQueries.find(item => item.normalizedQuery === normalizedQuery);
    if (existing) {
        existing.count += 1;
        existing.lastUsed = now;
        existing.query = query;
        existing.citedDocuments = citedDocuments;
        existing.inputTokens = (existing.inputTokens || 0) + inputTokens;
        existing.outputTokens = (existing.outputTokens || 0) + outputTokens;
    }
    else {
        summary.topQueries.push({
            normalizedQuery,
            query,
            count: 1,
            lastUsed: now,
            inputTokens,
            outputTokens,
            citedDocuments
        });
    }
    summary.topQueries = summary.topQueries
        .sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count;
        }
        return (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0);
    })
        .slice(0, 25);
    await summary.save();
};
const recordUsageSummaryForQuery = async ({ workspaceId, userId, tokens, inputTokens, outputTokens, query, citedDocuments }) => {
    await Promise.all([
        updateSummaryForQuery({
            workspaceId,
            userId,
            tokens,
            inputTokens,
            outputTokens,
            query,
            citedDocuments
        }),
        updateSummaryForQuery({
            workspaceId,
            userId: null,
            tokens,
            inputTokens,
            outputTokens,
            query,
            citedDocuments
        })
    ]);
};
exports.recordUsageSummaryForQuery = recordUsageSummaryForQuery;
const recordUsageSummaryForView = async ({ workspaceId, userId, lastViewed }) => {
    await UsageSummary_1.default.findOneAndUpdate({ workspaceId, userId }, {
        $setOnInsert: { workspaceId, userId },
        $set: { lastViewed }
    }, { upsert: true, new: true });
};
exports.recordUsageSummaryForView = recordUsageSummaryForView;
