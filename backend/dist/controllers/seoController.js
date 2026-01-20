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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aioChecker = exports.geoChecker = exports.aeoChecker = exports.seoChecker = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const response_1 = require("../utils/response");
// SEO Checker
const seoChecker = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, 'URL is required', 400);
        const startTime = Date.now();
        // Fetch the page
        // Fetch the page safely (SSRF Protection)
        // @ts-ignore
        const safeResponse = await Promise.resolve().then(() => __importStar(require('../utils/safeFetch'))).then(m => m.safeFetch(url, {
            headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
        }));
        const response = safeResponse;
        const $ = cheerio.load(response.data);
        const results = {
            url,
            queryTime: 0,
            meta: {
                title: $('title').text().trim() || null,
                titleLength: $('title').text().trim().length,
                description: $('meta[name="description"]').attr('content') || null,
                descriptionLength: ($('meta[name="description"]').attr('content') || '').length,
                keywords: $('meta[name="keywords"]').attr('content') || null,
                canonical: $('link[rel="canonical"]').attr('href') || null,
                robots: $('meta[name="robots"]').attr('content') || null,
                viewport: $('meta[name="viewport"]').attr('content') || null,
                ogTitle: $('meta[property="og:title"]').attr('content') || null,
                ogDescription: $('meta[property="og:description"]').attr('content') || null,
                ogImage: $('meta[property="og:image"]').attr('content') || null,
                twitterCard: $('meta[name="twitter:card"]').attr('content') || null
            },
            headings: {
                h1: $('h1').map((_, el) => $(el).text().trim()).get(),
                h2: $('h2').map((_, el) => $(el).text().trim()).get(),
                h3: $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 5)
            },
            links: {
                internal: $('a[href^="/"], a[href^="' + new URL(url).origin + '"]').length,
                external: $('a[href^="http"]').filter((_, el) => !$(el).attr('href')?.includes(new URL(url).hostname)).length,
                total: $('a').length
            },
            images: {
                total: $('img').length,
                withAlt: $('img[alt]').filter((_, el) => !!$(el).attr('alt')?.trim()).length,
                withoutAlt: $('img').filter((_, el) => !$(el).attr('alt')?.trim()).length
            },
            structuredData: {
                hasJsonLd: $('script[type="application/ld+json"]').length > 0,
                schemas: $('script[type="application/ld+json"]').map((_, el) => {
                    try {
                        const data = JSON.parse($(el).html() || '{}');
                        return data['@type'] || 'Unknown';
                    }
                    catch {
                        return 'Invalid';
                    }
                }).get()
            }
        };
        // Calculate scores
        const issues = [];
        const recommendations = [];
        // Title checks
        if (!results.meta.title) {
            issues.push('Missing title tag');
        }
        else if (results.meta.titleLength < 30) {
            issues.push('Title is too short (< 30 chars)');
        }
        else if (results.meta.titleLength > 60) {
            issues.push('Title is too long (> 60 chars)');
        }
        // Description checks
        if (!results.meta.description) {
            issues.push('Missing meta description');
            recommendations.push('Add a compelling meta description between 120-160 characters.');
        }
        else if (results.meta.descriptionLength < 120) {
            issues.push('Meta description is too short (< 120 chars)');
        }
        else if (results.meta.descriptionLength > 160) {
            issues.push('Meta description is too long (> 160 chars)');
        }
        // H1 checks
        if (results.headings.h1.length === 0) {
            issues.push('No H1 heading found');
            recommendations.push('Add a single H1 heading that describes the page content.');
        }
        else if (results.headings.h1.length > 1) {
            issues.push('Multiple H1 headings found (' + results.headings.h1.length + ')');
        }
        // Image alt checks
        if (results.images.withoutAlt > 0) {
            issues.push(`${results.images.withoutAlt} images missing alt text`);
            recommendations.push('Add descriptive alt text to all images for accessibility and SEO.');
        }
        // Canonical check
        if (!results.meta.canonical) {
            issues.push('Missing canonical URL');
            recommendations.push('Add a canonical link to prevent duplicate content issues.');
        }
        // Open Graph checks
        if (!results.meta.ogTitle || !results.meta.ogImage) {
            issues.push('Incomplete Open Graph tags');
            recommendations.push('Add og:title, og:description, and og:image for social sharing.');
        }
        // Structured data
        if (!results.structuredData.hasJsonLd) {
            recommendations.push('Consider adding JSON-LD structured data for rich snippets.');
        }
        results.queryTime = Date.now() - startTime;
        results.report = {
            score: Math.max(0, 100 - (issues.length * 10)),
            issues,
            recommendations,
            summary: issues.length === 0
                ? 'Excellent! All major SEO elements are properly configured.'
                : `${issues.length} issue(s) detected that may impact search visibility.`
        };
        return (0, response_1.sendSuccess)(res, results, 'SEO analysis complete');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `SEO analysis failed: ${error.message}`, 500);
    }
};
exports.seoChecker = seoChecker;
// AEO Checker (Answer Engine Optimization)
const aeoChecker = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, 'URL is required', 400);
        const startTime = Date.now();
        const response = await axios_1.default.get(url, {
            headers: { 'User-Agent': 'WorkToolsHub-AEO-Bot/1.0' },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        // Extract main content
        const bodyText = $('body').text().replace(/\\s+/g, ' ').trim().substring(0, 5000);
        const hasQuestions = /\\?/.test(bodyText);
        const hasFAQ = $('*[itemtype*="FAQPage"]').length > 0 || $('*[itemtype*="Question"]').length > 0;
        const hasHowTo = $('*[itemtype*="HowTo"]').length > 0;
        const hasLists = $('ol, ul').length;
        const hasTables = $('table').length;
        const results = {
            url,
            queryTime: 0,
            signals: {
                questionAnswerFormat: hasQuestions,
                faqSchema: hasFAQ,
                howToSchema: hasHowTo,
                structuredLists: hasLists > 2,
                dataTables: hasTables > 0,
                contentLength: bodyText.length,
                paragraphCount: $('p').length
            },
            issues: [],
            recommendations: []
        };
        if (!hasFAQ && hasQuestions) {
            results.recommendations.push('Consider adding FAQ schema markup to help search engines identify Q&A content.');
        }
        if (!results.signals.structuredLists) {
            results.recommendations.push('Use ordered/unordered lists to structure step-by-step or itemized content.');
        }
        if (results.signals.contentLength < 1000) {
            results.issues.push('Content may be too thin for answer engine visibility.');
            results.recommendations.push('Expand content to provide comprehensive answers (aim for 1500+ words for in-depth topics).');
        }
        results.queryTime = Date.now() - startTime;
        results.report = {
            score: Math.min(100, 50 + (hasFAQ ? 20 : 0) + (hasHowTo ? 15 : 0) + (hasLists > 2 ? 10 : 0) + (results.signals.contentLength > 1500 ? 5 : 0)),
            summary: results.issues.length === 0
                ? 'Content shows good answerability signals.'
                : `${results.issues.length} issue(s) may limit visibility in answer engines.`
        };
        return (0, response_1.sendSuccess)(res, results, 'AEO analysis complete');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `AEO analysis failed: ${error.message}`, 500);
    }
};
exports.aeoChecker = aeoChecker;
// GEO Checker (Generative Engine Optimization)
const geoChecker = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, 'URL is required', 400);
        const startTime = Date.now();
        const response = await axios_1.default.get(url, {
            headers: { 'User-Agent': 'WorkToolsHub-GEO-Bot/1.0' },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        const bodyText = $('body').text().replace(/\\s+/g, ' ').trim().substring(0, 8000);
        const results = {
            url,
            queryTime: 0,
            signals: {
                hasStructuredData: $('script[type="application/ld+json"]').length > 0,
                hasAuthor: $('*[rel="author"], .author, [itemprop="author"]').length > 0,
                hasDatePublished: $('*[itemprop="datePublished"], time[datetime]').length > 0,
                entityDensity: 'medium',
                contentClarity: bodyText.length > 2000 ? 'good' : 'needs expansion',
                citationLinks: $('a[href*="wikipedia"], a[href*=".edu"], a[href*=".gov"]').length
            },
            issues: [],
            recommendations: []
        };
        if (!results.signals.hasAuthor) {
            results.issues.push('No clear author attribution found.');
            results.recommendations.push('Add author information to establish E-E-A-T signals.');
        }
        if (!results.signals.hasDatePublished) {
            results.recommendations.push('Add publication date to help AI models assess content freshness.');
        }
        if (results.signals.citationLinks < 2) {
            results.recommendations.push('Consider citing authoritative sources to improve AI trust signals.');
        }
        results.queryTime = Date.now() - startTime;
        results.report = {
            score: Math.min(100, 60 + (results.signals.hasStructuredData ? 15 : 0) + (results.signals.hasAuthor ? 15 : 0) + (results.signals.citationLinks > 2 ? 10 : 0)),
            summary: results.issues.length === 0
                ? 'Content shows good AI visibility characteristics.'
                : `${results.issues.length} issue(s) may limit visibility in generative AI responses.`
        };
        return (0, response_1.sendSuccess)(res, results, 'GEO analysis complete');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `GEO analysis failed: ${error.message}`, 500);
    }
};
exports.geoChecker = geoChecker;
// AIO Checker (AI Optimization)
const aioChecker = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, 'URL is required', 400);
        const startTime = Date.now();
        const response = await axios_1.default.get(url, {
            headers: { 'User-Agent': 'WorkToolsHub-AIO-Bot/1.0' },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        const bodyText = $('body').text().replace(/\\s+/g, ' ').trim();
        const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(p => p.length > 50);
        // Estimate chunkability
        const avgParagraphLength = paragraphs.length > 0
            ? paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
            : 0;
        const results = {
            url,
            queryTime: 0,
            signals: {
                totalParagraphs: paragraphs.length,
                avgParagraphLength: Math.round(avgParagraphLength),
                chunkability: avgParagraphLength > 100 && avgParagraphLength < 500 ? 'optimal' : avgParagraphLength > 500 ? 'too dense' : 'too sparse',
                headingStructure: $('h1, h2, h3, h4').length,
                contentDensity: bodyText.length > 3000 ? 'high' : bodyText.length > 1000 ? 'medium' : 'low',
                hasCodeBlocks: $('pre, code').length > 0,
                hasDefinitions: $('dl, dfn, abbr[title]').length > 0
            },
            issues: [],
            recommendations: []
        };
        if (results.signals.chunkability === 'too dense') {
            results.issues.push('Paragraphs are too long for optimal LLM processing.');
            results.recommendations.push('Break up long paragraphs into 100-400 character chunks for better retrieval.');
        }
        if (results.signals.headingStructure < 3) {
            results.recommendations.push('Add more headings to improve content structure for AI indexing.');
        }
        if (!results.signals.hasDefinitions && results.signals.contentDensity === 'high') {
            results.recommendations.push('Consider using definition lists or abbreviation tags for technical terms.');
        }
        results.queryTime = Date.now() - startTime;
        results.report = {
            score: Math.min(100, 50 + (results.signals.chunkability === 'optimal' ? 25 : 0) + (results.signals.headingStructure >= 5 ? 15 : 5) + (results.signals.contentDensity === 'high' ? 10 : 0)),
            summary: results.issues.length === 0
                ? 'Content is well-optimized for LLM retrieval and processing.'
                : `${results.issues.length} issue(s) may impact AI retrieval quality.`
        };
        return (0, response_1.sendSuccess)(res, results, 'AIO analysis complete');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `AIO analysis failed: ${error.message}`, 500);
    }
};
exports.aioChecker = aioChecker;
