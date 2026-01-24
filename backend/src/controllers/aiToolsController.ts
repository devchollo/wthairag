import { Request, Response } from 'express';
import axios from 'axios';
import { sendSuccess, sendError } from '../utils/response';

// Alt Text Generator using OpenAI Vision
export const generateAltText = async (req: Request, res: Response) => {
    try {
        const file = req.file as Express.Multer.File | undefined;
        const { imageUrl } = req.body;

        if (!file && !imageUrl) {
            return sendError(res, 'Image file or URL is required', 400);
        }

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return sendError(res, 'OpenAI API key not configured', 500);
        }

        let base64Image: string | null = null;
        let imageSource: string;

        if (file) {
            // Convert uploaded file to base64
            base64Image = file.buffer.toString('base64');
            const mimeType = file.mimetype;
            imageSource = `data:${mimeType};base64,${base64Image}`;
        } else {
            imageSource = imageUrl;
        }

        // Call OpenAI Vision API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
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
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content || '';

        // Parse the JSON response
        let altTexts: { accessibility: string; seo: string; detailed: string };
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                altTexts = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: use the content directly
                altTexts = {
                    accessibility: content.substring(0, 125),
                    seo: content.substring(0, 150),
                    detailed: content.substring(0, 250)
                };
            }
        } catch {
            altTexts = {
                accessibility: content.substring(0, 125),
                seo: content.substring(0, 150),
                detailed: content.substring(0, 250)
            };
        }

        return sendSuccess(res, {
            variants: [
                { type: 'Accessibility', text: altTexts.accessibility, charCount: altTexts.accessibility.length },
                { type: 'SEO', text: altTexts.seo, charCount: altTexts.seo.length },
                { type: 'Detailed', text: altTexts.detailed, charCount: altTexts.detailed.length }
            ],
            source: file ? 'upload' : 'url'
        }, 'Alt text generated successfully');
    } catch (error: any) {
        console.error('Alt text generation error:', error.response?.data || error.message);
        return sendError(res, `Alt text generation failed: ${error.response?.data?.error?.message || error.message}`, 500);
    }
};
