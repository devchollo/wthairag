"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAltText = void 0;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../utils/response");
// Alt Text Generator using OpenAI Vision
const generateAltText = async (req, res) => {
    try {
        const file = req.file;
        const { imageUrl } = req.body;
        if (!file && !imageUrl) {
            return (0, response_1.sendError)(res, 'Image file or URL is required', 400);
        }
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return (0, response_1.sendError)(res, 'OpenAI API key not configured', 500);
        }
        let base64Image = null;
        let imageSource;
        if (file) {
            // Convert uploaded file to base64
            base64Image = file.buffer.toString('base64');
            const mimeType = file.mimetype;
            imageSource = `data:${mimeType};base64,${base64Image}`;
        }
        else {
            imageSource = imageUrl;
        }
        // Call OpenAI Vision API
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this image and provide 3 different alt text descriptions:

1. **Accessibility-focused**: A concise description for screen readers (under 125 characters)
2. **SEO-optimized**: A description that incorporates potential keywords (under 150 characters)  
3. **Detailed**: A comprehensive description for context (under 250 characters)

Format your response as JSON with keys: accessibility, seo, detailed`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageSource,
                                detail: 'low'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const content = response.data.choices[0]?.message?.content || '';
        // Parse the JSON response
        let altTexts;
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                altTexts = JSON.parse(jsonMatch[0]);
            }
            else {
                // Fallback: use the content directly
                altTexts = {
                    accessibility: content.substring(0, 125),
                    seo: content.substring(0, 150),
                    detailed: content.substring(0, 250)
                };
            }
        }
        catch {
            altTexts = {
                accessibility: content.substring(0, 125),
                seo: content.substring(0, 150),
                detailed: content.substring(0, 250)
            };
        }
        return (0, response_1.sendSuccess)(res, {
            variants: [
                { type: 'Accessibility', text: altTexts.accessibility, charCount: altTexts.accessibility.length },
                { type: 'SEO', text: altTexts.seo, charCount: altTexts.seo.length },
                { type: 'Detailed', text: altTexts.detailed, charCount: altTexts.detailed.length }
            ],
            source: file ? 'upload' : 'url'
        }, 'Alt text generated successfully');
    }
    catch (error) {
        console.error('Alt text generation error:', error.response?.data || error.message);
        return (0, response_1.sendError)(res, `Alt text generation failed: ${error.response?.data?.error?.message || error.message}`, 500);
    }
};
exports.generateAltText = generateAltText;
