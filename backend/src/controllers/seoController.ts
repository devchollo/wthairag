import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';
import { safeFetch } from '../utils/safeFetch';

const MAX_CRAWL_PAGES = 10;
const MAX_KEYWORDS = 8;
const MAX_COMPETITORS = 5;
const STOPWORDS = new Set([
    'the', 'and', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about',
    'into', 'over', 'after', 'beneath', 'under', 'above', 'be', 'is', 'are', 'was', 'were', 'that',
    'this', 'it', 'as', 'or', 'if', 'but', 'not', 'your', 'you', 'we', 'our', 'their', 'they', 'i'
]);
const COMMON_TERMS = new Set([
    'about', 'access', 'account', 'analytics', 'api', 'app', 'apps', 'blog', 'careers', 'community',
    'contact', 'dashboard', 'developer', 'developers', 'docs', 'documentation', 'enterprise', 'faq',
    'features', 'help', 'home', 'login', 'pricing', 'privacy', 'product', 'products', 'resources',
    'security', 'services', 'sign', 'signin', 'signup', 'solutions', 'sponsor', 'sponsorship',
    'support', 'terms', 'tool', 'tools'
]);

const seoRequestSchema = z.object({
    url: z.string().trim().url().max(2048),
    keywords: z.string().trim().max(500).optional(),
    competitors: z.array(z.string().trim().url().max(2048)).max(MAX_COMPETITORS).optional(),
    crawlLimit: z.number().int().min(1).max(MAX_CRAWL_PAGES).optional()
});

const sanitizeKeywords = (rawKeywords?: string) => {
    if (!rawKeywords) return [];
    const cleaned = rawKeywords
        .split(',')
        .map(keyword => keyword.trim().toLowerCase())
        .filter(Boolean)
        .map(keyword => keyword.replace(/[^a-z0-9\\s-]/g, '').trim())
        .filter(Boolean)
        .slice(0, MAX_KEYWORDS);
    return Array.from(new Set(cleaned));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const extractText = ($: cheerio.CheerioAPI) => {
    $('script, style, noscript').remove();
    return $('body').text().replace(/\\s+/g, ' ').trim();
};

const wordFrequency = (text: string) => {
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, ' ')
        .split(/\\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 2 && !STOPWORDS.has(word));
    const counts = new Map<string, number>();
    words.forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
    return { words, counts };
};

const segmentToken = (token: string, vocab: Set<string>) => {
    if (token.length < 12) return token;
    const lower = token.toLowerCase();
    const dp: Array<{ words: string[]; score: number } | null> = Array(lower.length + 1).fill(null);
    dp[0] = { words: [], score: 0 };
    for (let i = 0; i < lower.length; i++) {
        if (!dp[i]) continue;
        for (let j = i + 3; j <= lower.length; j++) {
            const chunk = lower.slice(i, j);
            if (!vocab.has(chunk)) continue;
            const prev = dp[i]!;
            const words = [...prev.words, chunk];
            const score = prev.score + chunk.length + 2;
            if (!dp[j] || score > dp[j]!.score) {
                dp[j] = { words, score };
            }
        }
    }
    const result = dp[lower.length];
    if (!result || result.words.length < 2) return token;
    return result.words.join(' ');
};

const parseRobotsTxt = (robotsBody: string) => {
    const lines = robotsBody.split(/\\r?\\n/).map(line => line.trim());
    const disallow: string[] = [];
    const sitemapUrls: string[] = [];
    let appliesToAll = false;
    lines.forEach(line => {
        if (!line || line.startsWith('#')) return;
        const [directive, value] = line.split(':').map(part => part.trim());
        if (!directive || value === undefined) return;
        const lower = directive.toLowerCase();
        if (lower === 'user-agent') {
            appliesToAll = value === '*' ? true : false;
        }
        if (appliesToAll && lower === 'disallow' && value) {
            disallow.push(value);
        }
        if (lower === 'sitemap' && value) {
            sitemapUrls.push(value);
        }
    });
    return { disallow, sitemapUrls };
};

const isPathDisallowed = (path: string, disallowRules: string[]) => {
    return disallowRules.some(rule => {
        if (rule === '/') return true;
        return rule && path.startsWith(rule);
    });
};

const getPageSpeedMetrics = async (targetUrl: string) => {
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
        return { status: 'unavailable', reason: 'PAGESPEED_API_KEY not configured' };
    }
    const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    try {
        const response = await axios.get(endpoint, {
            params: {
                url: targetUrl,
                category: 'performance',
                strategy: 'mobile',
                key: apiKey
            },
            timeout: 25000
        });
        const audits = response.data?.lighthouseResult?.audits || {};
        const lcp = audits['largest-contentful-paint'];
        const cls = audits['cumulative-layout-shift'];
        const inp = audits['interaction-to-next-paint'] || audits['max-potential-fid'];
        return {
            status: 'available',
            metrics: {
                lcp: lcp?.displayValue || null,
                cls: cls?.displayValue || null,
                inp: inp?.displayValue || null
            },
            score: response.data?.lighthouseResult?.categories?.performance?.score ?? null
        };
    } catch (error: any) {
        const isTimeout = error?.code === 'ECONNABORTED' || `${error?.message || ''}`.toLowerCase().includes('timeout');
        if (isTimeout) {
            return { status: 'unavailable', reason: 'Performance data timed out. Try again in a moment.' };
        }
        return { status: 'error', reason: 'Performance data unavailable due to a PageSpeed request error.' };
    }
};

const getSerpInsights = async (targetUrl: string, keywords: string[]) => {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        return {
            status: 'unavailable',
            reason: 'SERPAPI_KEY not configured',
            positions: [],
            serpFeatures: []
        };
    }
    if (keywords.length === 0) {
        return { status: 'unavailable', reason: 'No keywords provided', positions: [], serpFeatures: [] };
    }
    const hostname = new URL(targetUrl).hostname.replace(/^www\\./, '');
    const positions: Array<{ keyword: string; position: number | null; url: string | null }> = [];
    const serpFeatures = new Set<string>();
    const keywordSubset = keywords.slice(0, 3);

    for (const keyword of keywordSubset) {
        try {
            const response = await axios.get('https://serpapi.com/search.json', {
                params: {
                    engine: 'google',
                    q: keyword,
                    api_key: apiKey,
                    num: 10
                },
                timeout: 15000
            });
            const organicResults = response.data?.organic_results || [];
            let position: number | null = null;
            let matchedUrl: string | null = null;
            organicResults.forEach((result: any, index: number) => {
                const link = result.link || '';
                if (link.includes(hostname) && position === null) {
                    position = index + 1;
                    matchedUrl = link;
                }
            });
            if (response.data?.answer_box) serpFeatures.add('Answer Box');
            if (response.data?.knowledge_graph) serpFeatures.add('Knowledge Panel');
            if (response.data?.people_also_ask?.length) serpFeatures.add('People Also Ask');
            if (response.data?.related_questions?.length) serpFeatures.add('Related Questions');
            positions.push({ keyword, position, url: matchedUrl });
        } catch (error) {
            positions.push({ keyword, position: null, url: null });
        }
    }

    return {
        status: 'available',
        reason: null,
        positions,
        serpFeatures: Array.from(serpFeatures)
    };
};

const analyzeKeywords = (text: string, keywords: string[], meta: { title?: string | null; description?: string | null; h1?: string[] }) => {
    const { words, counts } = wordFrequency(text);
    const totalWords = words.length || 1;
    const keywordStats = keywords.map(keyword => {
        const occurrences = text.toLowerCase().split(keyword).length - 1;
        const density = clamp((occurrences / totalWords) * 100, 0, 100);
        return {
            keyword,
            occurrences,
            density: Number(density.toFixed(2)),
            inTitle: meta.title?.toLowerCase().includes(keyword) || false,
            inDescription: meta.description?.toLowerCase().includes(keyword) || false,
            inH1: meta.h1?.some(h1 => h1.toLowerCase().includes(keyword)) || false
        };
    });
    const vocab = new Set([...counts.keys(), ...COMMON_TERMS]);
    const topTerms = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([term, count]) => ({ term: segmentToken(term, vocab), count }));
    return { keywordStats, totalWords, topTerms };
};

// SEO Checker
export const seoChecker = async (req: Request, res: Response) => {
    try {
        const parsed = seoRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return sendError(res, 'Invalid input. Please provide a valid URL and optional keywords.', 400);
        }
        const { url, keywords, competitors, crawlLimit } = parsed.data;
        const keywordList = sanitizeKeywords(keywords);
        const crawlCap = crawlLimit ?? 6;

        const startTime = Date.now();

        // Fetch the page safely (SSRF Protection)
        const response = await safeFetch(url, {
            headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
        });

        const $ = cheerio.load(response.data);
        const pageText = extractText($);
        const origin = new URL(url).origin;
        const path = new URL(url).pathname;

        const robotsUrl = `${origin}/robots.txt`;
        const sitemapUrl = `${origin}/sitemap.xml`;
        let robotsInfo = { status: 'unknown', disallow: [] as string[], sitemaps: [] as string[] };
        try {
            const robotsResponse = await safeFetch(robotsUrl, {
                headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
            });
            const parsedRobots = parseRobotsTxt(robotsResponse.data || '');
            robotsInfo = {
                status: robotsResponse.status >= 200 && robotsResponse.status < 300 ? 'valid' : 'invalid',
                disallow: parsedRobots.disallow,
                sitemaps: parsedRobots.sitemapUrls
            };
        } catch (error) {
            robotsInfo = { status: 'missing', disallow: [], sitemaps: [] };
        }

        let sitemapInfo = { status: 'unknown', url: sitemapUrl, urlCount: 0, errors: [] as string[] };
        const sitemapCandidates = robotsInfo.sitemaps.length > 0 ? robotsInfo.sitemaps : [sitemapUrl];
        for (const candidate of sitemapCandidates) {
            try {
                const sitemapResponse = await safeFetch(candidate, {
                    headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
                });
                const xml = cheerio.load(sitemapResponse.data || '', { xmlMode: true });
                const urlCount = xml('urlset url').length + xml('sitemapindex sitemap').length;
                sitemapInfo = {
                    status: sitemapResponse.status >= 200 && sitemapResponse.status < 300 ? 'valid' : 'invalid',
                    url: candidate,
                    urlCount,
                    errors: urlCount === 0 ? ['No URLs found in sitemap.'] : []
                };
                break;
            } catch (error: any) {
                sitemapInfo.errors.push(`Failed to fetch sitemap: ${candidate}`);
                sitemapInfo.status = 'missing';
            }
        }

        const crawlResults: Array<{
            url: string;
            status: number;
            title: string | null;
            indexable: boolean;
            issues: string[];
        }> = [];
        const queue: Array<{ url: string; depth: number }> = [{ url, depth: 0 }];
        const visited = new Set<string>();

        while (queue.length > 0 && crawlResults.length < crawlCap) {
            const current = queue.shift();
            if (!current || visited.has(current.url)) continue;
            visited.add(current.url);
            try {
                const pageResponse = await safeFetch(current.url, {
                    headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
                });
                const page$ = cheerio.load(pageResponse.data);
                const metaRobots = page$('meta[name="robots"]').attr('content') || '';
                const canonical = page$('link[rel="canonical"]').attr('href') || null;
                const noindex = metaRobots.toLowerCase().includes('noindex');
                const pagePath = new URL(current.url).pathname;
                const disallowed = isPathDisallowed(pagePath, robotsInfo.disallow);
                const issues: string[] = [];
                if (pageResponse.status >= 400) issues.push(`HTTP ${pageResponse.status} response`);
                if (noindex) issues.push('Meta robots set to noindex');
                if (disallowed) issues.push('Blocked by robots.txt');
                if (!canonical) issues.push('Missing canonical URL');
                crawlResults.push({
                    url: current.url,
                    status: pageResponse.status,
                    title: page$('title').text().trim() || null,
                    indexable: !noindex && !disallowed && pageResponse.status < 400,
                    issues
                });

                if (current.depth < 1) {
                    page$('a[href]').each((_, el) => {
                        const href = page$(el).attr('href');
                        if (!href) return;
                        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
                        try {
                            const absolute = new URL(href, origin).toString();
                            if (absolute.startsWith(origin)) {
                                queue.push({ url: absolute, depth: current.depth + 1 });
                            }
                        } catch {
                            return;
                        }
                    });
                }
            } catch (error) {
                crawlResults.push({
                    url: current.url,
                    status: 0,
                    title: null,
                    indexable: false,
                    issues: ['Failed to crawl page']
                });
            }
        }

        const indexableCount = crawlResults.filter(result => result.indexable).length;
        const crawlIssues = crawlResults.flatMap(result => result.issues.map(issue => `${result.url}: ${issue}`));

        const keywordInsights = analyzeKeywords(pageText, keywordList, {
            title: $('title').text().trim(),
            description: $('meta[name="description"]').attr('content') || null,
            h1: $('h1').map((_, el) => $(el).text().trim()).get()
        });
        const keywordCoverage = keywordList.length
            ? keywordList.filter(keyword => pageText.toLowerCase().includes(keyword)).length / keywordList.length
            : 0;
        const qualityScore = clamp(
            Math.round(40 + (keywordInsights.totalWords / 20) + (keywordCoverage * 40)),
            0,
            100
        );

        const competitorInsights: Array<{
            url: string;
            wordCount: number;
            keywordCoverage: number;
        }> = [];
        if (competitors && competitors.length > 0) {
            for (const competitor of competitors) {
                try {
                    const competitorResponse = await safeFetch(competitor, {
                        headers: { 'User-Agent': 'WorkToolsHub-SEO-Bot/1.0' }
                    });
                    const competitor$ = cheerio.load(competitorResponse.data);
                    const competitorText = extractText(competitor$);
                    const { totalWords } = analyzeKeywords(competitorText, keywordList, {});
                    const keywordCoverage = keywordList.length
                        ? keywordList.filter(keyword => competitorText.toLowerCase().includes(keyword)).length / keywordList.length
                        : 0;
                    competitorInsights.push({
                        url: competitor,
                        wordCount: totalWords,
                        keywordCoverage: Number((keywordCoverage * 100).toFixed(0))
                    });
                } catch {
                    competitorInsights.push({ url: competitor, wordCount: 0, keywordCoverage: 0 });
                }
            }
        }

        const avgCompetitorWords = competitorInsights.length
            ? competitorInsights.reduce((sum, item) => sum + item.wordCount, 0) / competitorInsights.length
            : 0;

        const performance = await getPageSpeedMetrics(url);
        const serpInsights = await getSerpInsights(url, keywordList);

        const results: any = {
            url,
            queryTime: 0,
            crawl: {
                pagesScanned: crawlResults.length,
                indexableCount,
                nonIndexableCount: crawlResults.length - indexableCount,
                issues: crawlIssues,
                pages: crawlResults,
                robots: {
                    status: robotsInfo.status,
                    disallowCount: robotsInfo.disallow.length,
                    allowsTargetPath: !isPathDisallowed(path, robotsInfo.disallow)
                },
                sitemap: sitemapInfo
            },
            performance,
            content: {
                wordCount: keywordInsights.totalWords,
                keywordStats: keywordInsights.keywordStats,
                topTerms: keywordInsights.topTerms,
                qualityScore,
                semanticSuggestions: keywordInsights.topTerms.map(term => term.term),
                competitorBenchmarks: competitorInsights,
                gapAnalysis: avgCompetitorWords > 0
                    ? Math.round(avgCompetitorWords - keywordInsights.totalWords)
                    : 0
            },
            rankTracking: {
                status: serpInsights.status,
                reason: serpInsights.reason,
                keywords: keywordList,
                positions: serpInsights.positions
            },
            userBehavior: {
                status: process.env.GA_PROPERTY_ID ? 'available' : 'unavailable',
                reason: process.env.GA_PROPERTY_ID ? null : 'GA_PROPERTY_ID not configured',
                bounceRate: null,
                engagementTime: null,
                lowEngagementPages: []
            },
            competitorSerp: {
                status: serpInsights.status,
                reason: serpInsights.reason,
                serpFeatures: serpInsights.serpFeatures,
                competitorGaps: competitorInsights
            },
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
                    } catch { return 'Invalid'; }
                }).get()
            }
        };

        // Calculate scores
        const issues: string[] = [];
        const recommendations: string[] = [];
        const remediation: Array<{ issue: string; severity: 'high' | 'medium' | 'low'; impact: string; fix: string; example?: string }> = [];

        // Title checks
        if (!results.meta.title) {
            issues.push('Missing title tag');
            remediation.push({
                issue: 'Missing title tag',
                severity: 'high',
                impact: 'Search engines and users lack a primary page label in results.',
                fix: 'Add a concise title between 50-60 characters containing your primary keyword.',
                example: 'Example: “Enterprise SEO Analyzer | WorkToolsHub”'
            });
        } else if (results.meta.titleLength < 30) {
            issues.push('Title is too short (< 30 chars)');
            remediation.push({
                issue: 'Title is too short',
                severity: 'medium',
                impact: 'Short titles reduce relevance signals and click-through appeal.',
                fix: 'Expand the title to include a clear benefit and target keyword.',
                example: 'Example: “SEO Analyzer for Technical Audits & Rankings”'
            });
        } else if (results.meta.titleLength > 60) {
            issues.push('Title is too long (> 60 chars)');
            remediation.push({
                issue: 'Title is too long',
                severity: 'low',
                impact: 'Titles longer than 60 characters can be truncated in search results.',
                fix: 'Trim the title to focus on the most important keyword and value.',
                example: 'Example: “SEO Analyzer for High-Impact Audits”'
            });
        }

        // Description checks
        if (!results.meta.description) {
            issues.push('Missing meta description');
            recommendations.push('Add a compelling meta description between 120-160 characters.');
            remediation.push({
                issue: 'Missing meta description',
                severity: 'medium',
                impact: 'Low click-through rate from search results.',
                fix: 'Write a 120–155 character description with a value proposition and target keyword.',
                example: 'Example: “Audit technical SEO, Core Web Vitals, and rankings in minutes.”'
            });
        } else if (results.meta.descriptionLength < 120) {
            issues.push('Meta description is too short (< 120 chars)');
            remediation.push({
                issue: 'Meta description is too short',
                severity: 'low',
                impact: 'Short snippets may fail to persuade searchers.',
                fix: 'Expand the description to include a clear benefit and CTA.',
                example: 'Example: “Get a full SEO report covering crawlability, content, and performance.”'
            });
        } else if (results.meta.descriptionLength > 160) {
            issues.push('Meta description is too long (> 160 chars)');
            remediation.push({
                issue: 'Meta description is too long',
                severity: 'low',
                impact: 'Long descriptions can be truncated in search results.',
                fix: 'Trim to 120–160 characters and keep the main keyword early.'
            });
        }

        // H1 checks
        if (results.headings.h1.length === 0) {
            issues.push('No H1 heading found');
            recommendations.push('Add a single H1 heading that describes the page content.');
            remediation.push({
                issue: 'Missing H1 heading',
                severity: 'medium',
                impact: 'The page lacks a clear, crawlable primary topic signal.',
                fix: 'Add a single H1 that matches the page’s primary keyword.'
            });
        } else if (results.headings.h1.length > 1) {
            issues.push('Multiple H1 headings found (' + results.headings.h1.length + ')');
            remediation.push({
                issue: 'Multiple H1 headings',
                severity: 'low',
                impact: 'Search engines may struggle to identify the main topic.',
                fix: 'Consolidate to one H1 and use H2/H3 for secondary sections.'
            });
        }

        // Image alt checks
        if (results.images.withoutAlt > 0) {
            issues.push(`${results.images.withoutAlt} images missing alt text`);
            recommendations.push('Add descriptive alt text to all images for accessibility and SEO.');
            remediation.push({
                issue: 'Images missing alt text',
                severity: 'medium',
                impact: 'Reduced accessibility and missed image search traffic.',
                fix: 'Provide descriptive alt text that includes relevant keywords where appropriate.'
            });
        }

        // Canonical check
        if (!results.meta.canonical) {
            issues.push('Missing canonical URL');
            recommendations.push('Add a canonical link to prevent duplicate content issues.');
            remediation.push({
                issue: 'Missing canonical URL',
                severity: 'medium',
                impact: 'Duplicate content can dilute rankings.',
                fix: 'Add a canonical tag that points to the preferred URL.'
            });
        }

        // Open Graph checks
        if (!results.meta.ogTitle || !results.meta.ogImage) {
            issues.push('Incomplete Open Graph tags');
            recommendations.push('Add og:title, og:description, and og:image for social sharing.');
            remediation.push({
                issue: 'Incomplete Open Graph tags',
                severity: 'low',
                impact: 'Social shares may look incomplete, reducing click-through.',
                fix: 'Add og:title, og:description, and og:image tags for rich previews.'
            });
        }

        // Structured data
        if (!results.structuredData.hasJsonLd) {
            recommendations.push('Consider adding JSON-LD structured data for rich snippets.');
            remediation.push({
                issue: 'Missing JSON-LD structured data',
                severity: 'low',
                impact: 'Less visibility for rich results and snippets.',
                fix: 'Add JSON-LD schema for your primary content type (Article, Product, FAQ).'
            });
        }

        results.queryTime = Date.now() - startTime;
        results.report = {
            score: Math.max(0, 100 - (issues.length * 10)),
            issues,
            recommendations,
            remediation,
            summary: issues.length === 0
                ? 'Excellent! All major SEO elements are properly configured.'
                : `${issues.length} issue(s) detected that may impact search visibility.`
        };

        return sendSuccess(res, results, 'SEO analysis complete');
    } catch (error: any) {
        return sendError(res, `SEO analysis failed: ${error.message}`, 500);
    }
};

// AEO Checker (Answer Engine Optimization)
export const aeoChecker = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) return sendError(res, 'URL is required', 400);

        const startTime = Date.now();
        const response = await axios.get(url, {
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

        const results: any = {
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
            issues: [] as string[],
            recommendations: [] as string[]
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

        return sendSuccess(res, results, 'AEO analysis complete');
    } catch (error: any) {
        return sendError(res, `AEO analysis failed: ${error.message}`, 500);
    }
};

// GEO Checker (Generative Engine Optimization)
export const geoChecker = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) return sendError(res, 'URL is required', 400);

        const startTime = Date.now();
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'WorkToolsHub-GEO-Bot/1.0' },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const bodyText = $('body').text().replace(/\\s+/g, ' ').trim().substring(0, 8000);

        const results: any = {
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
            issues: [] as string[],
            recommendations: [] as string[]
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

        return sendSuccess(res, results, 'GEO analysis complete');
    } catch (error: any) {
        return sendError(res, `GEO analysis failed: ${error.message}`, 500);
    }
};

// AIO Checker (AI Optimization)
export const aioChecker = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) return sendError(res, 'URL is required', 400);

        const startTime = Date.now();
        const response = await axios.get(url, {
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

        const results: any = {
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
            issues: [] as string[],
            recommendations: [] as string[]
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

        return sendSuccess(res, results, 'AIO analysis complete');
    } catch (error: any) {
        return sendError(res, `AIO analysis failed: ${error.message}`, 500);
    }
};
