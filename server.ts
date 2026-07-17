import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for Google GenAI client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Lazy initializer for OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it in Settings > Secrets.');
    }
    openaiClient = new OpenAI({
      apiKey: key,
    });
  }
  return openaiClient;
}


// Retailer domain identification
function detectRetailer(urlStr: string): { name: string; key: string } {
  try {
    const parsedUrl = new URL(urlStr);
    const host = parsedUrl.hostname.toLowerCase();
    
    if (host.includes('amazon') || host.includes('amzn')) {
      return { name: 'Amazon', key: 'amazon' };
    }
    if (host.includes('flipkart')) {
      return { name: 'Flipkart', key: 'flipkart' };
    }
    if (host.includes('myntra')) {
      return { name: 'Myntra', key: 'myntra' };
    }
    if (host.includes('nykaa')) {
      return { name: 'Nykaa', key: 'nykaa' };
    }
    if (host.includes('ajio')) {
      return { name: 'Ajio', key: 'ajio' };
    }
    if (host.includes('hm.com') || host.includes('hm/')) {
      return { name: 'H&M', key: 'hm' };
    }
    if (host.includes('croma')) {
      return { name: 'Croma', key: 'croma' };
    }
    if (host.includes('reliancedigital')) {
      return { name: 'Reliance Digital', key: 'reliancedigital' };
    }
    if (host.includes('tatacliq')) {
      return { name: 'Tata CLiQ', key: 'tatacliq' };
    }
    return { name: 'Other Retailer', key: 'other' };
  } catch (e) {
    return { name: 'Unknown', key: 'unknown' };
  }
}

// Enterprise-Grade AI Product Import API Endpoint
app.post('/api/import-product', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid product URL.' });
  }

  const retailer = detectRetailer(url);
  
  try {
    const ai = getGenAI();

    console.log(`Analyzing product URL: ${url} for retailer: ${retailer.name}...`);

    // We will call the modern Gemini 3.5-flash model with Google Search grounding enabled.
    // This allows robust, live, public-data retrieval even when standard scrapers are blocked.
    const prompt = `You are an enterprise product intelligence engine for Alankapriya, a premium product reviews, recommendations, and affiliate curation platform.
    
    A user wants to import an affiliate product by pasting this URL:
    URL: ${url}
    Detected Retailer: ${retailer.name} (Retailer key: ${retailer.key})
    
    Please use Google Search grounding to retrieve current, live product information, specifications, pricing, brand details, and expert or customer reviews/feedback.
    
    Using the retrieved data, generate a complete, high-quality, professional, and SEO-friendly affiliate product catalog entry matching Alankapriya's sophisticated design and content guidelines.
    
    CRITICAL INSTRUCTIONS:
    1. Tone & Styling: Ensure all descriptions are written in a sophisticated, premium, brand-neutral, editorial-grade manner. Provide deep insights (at least 3 paragraphs of beautiful Markdown for the main description, and detailed overview, performance, and verdict sections).
    2. Pricing: If you find pricing in Indian Rupees (INR/₹) or another non-USD currency, convert it to USD ($) using a standard conversion rate (1 USD = 83 INR). Return numeric pricing only (e.g., 99.99, not "$99").
    3. Specifications: Return an array of specifications containing key-value pairs (e.g. key: "Connectivity", value: "Bluetooth 5.3").
    4. Image URLs: Return 1 to 4 public, clean image URLs. If direct e-commerce images are protected or private, generate high-quality Unsplash image URLs of professional product photography that directly match this specific type and category of product.
    5. Affiliate & Retailer URLs: Populate the URL field corresponding to this retailer with the input URL, and set the correct retailer price.
    6. Ensure that you return a fully filled, well-structured, valid JSON object strictly matching the schema.
    `;

    let productData;
    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'SEO-friendly premium product title (e.g. Sony WH-1000XM5 Wireless Headphones)' },
                brand: { type: Type.STRING, description: 'Brand name' },
                category: { type: Type.STRING, description: 'Product category. Must be one of: Audio, Mobiles, Fashion, Laptops, Wearables, Smart Home, Gaming, Accessories, Beauty' },
                subcategory: { type: Type.STRING, description: 'Detailed subcategory, e.g. Over-Ear ANC, Smart Watch, Running Shoes' },
                description: { type: Type.STRING, description: 'Elegant, detailed 3-paragraph product description in beautiful Markdown format' },
                shortDescription: { type: Type.STRING, description: 'A punchy, attractive 1-sentence e-commerce teaser (15-25 words)' },
                rating: { type: Type.NUMBER, description: 'Calculated rating out of 5.0 (e.g., 4.8)' },
                price: { type: Type.NUMBER, description: 'Curation price in USD ($). Convert from INR if needed (1 USD = 83 INR).' },
                originalPrice: { type: Type.NUMBER, description: 'Original/List MRP in USD ($). If no discount, set equal to price.' },
                isBestSeller: { type: Type.BOOLEAN, description: 'Whether this product is a bestseller in its category' },
                isEditorsChoice: { type: Type.BOOLEAN, description: 'Whether our editorial staff awards this a recommendation' },
                isDailyStar: { type: Type.BOOLEAN, description: 'Whether this is a featured high-discount deal' },
                overview: { type: Type.STRING, description: 'Sophisticated introductory overview of the product (1-2 paragraphs)' },
                performance: { type: Type.STRING, description: 'Detailed evaluation of real-world performance, comfort, and build quality' },
                verdict: { type: Type.STRING, description: 'Final expert buying verdict and justification (1 paragraph)' },
                keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 5 highlight bullet points' },
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 4 pros' },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2 to 3 cons' },
                whoShouldBuy: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2 to 3 target audiences' },
                whoShouldAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: '1 to 2 situations/users who should avoid it' },
                specifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING, description: 'Name of spec, e.g. Connectivity, Battery Life, Material' },
                      value: { type: Type.STRING, description: 'Value of spec, e.g. Bluetooth 5.3, 40 Hours, Aluminum' }
                    },
                    required: ['key', 'value']
                  }
                },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'E-commerce and search tags, e.g., ANC, Headphones, Bluetooth' },
                sizes: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Available sizes (if fashion, otherwise empty)' },
                colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'E-commerce color variants' },
                aiTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A few semantic tags for smart recommendations' },
                communityExpertSummary: { type: Type.STRING, description: '1-paragraph expert consensus summary' },
                recommendationNotes: { type: Type.STRING, description: 'Our custom buying tip, e.g., Buy during festive sales for best price.' },
                images: { type: Type.ARRAY, items: { type: Type.STRING }, description: '1 to 4 clean public e-commerce or high-quality Unsplash image URLs' }
              },
              required: ['title', 'brand', 'category', 'description', 'shortDescription', 'price', 'originalPrice']
            }
          }
        });
      } catch (err: any) {
        console.warn('Google Search grounding failed or hit quota limits, falling back to standard generation...', err);
        
        const fallbackPrompt = `${prompt}
        
        Note: Search grounding is currently bypassed due to heavy quota constraints. Please analyze the product URL path, subdomain, and query parameters directly to identify the product title, brand, category, and specifications. Use your extensive default catalog knowledge to draft high-quality original reviews and populate all schema fields beautifully.`;

        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: fallbackPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'SEO-friendly premium product title (e.g. Sony WH-1000XM5 Wireless Headphones)' },
                brand: { type: Type.STRING, description: 'Brand name' },
                category: { type: Type.STRING, description: 'Product category. Must be one of: Audio, Mobiles, Fashion, Laptops, Wearables, Smart Home, Gaming, Accessories, Beauty' },
                subcategory: { type: Type.STRING, description: 'Detailed subcategory, e.g. Over-Ear ANC, Smart Watch, Running Shoes' },
                description: { type: Type.STRING, description: 'Elegant, detailed 3-paragraph product description in beautiful Markdown format' },
                shortDescription: { type: Type.STRING, description: 'A punchy, attractive 1-sentence e-commerce teaser (15-25 words)' },
                rating: { type: Type.NUMBER, description: 'Calculated rating out of 5.0 (e.g., 4.8)' },
                price: { type: Type.NUMBER, description: 'Curation price in USD ($). Convert from INR if needed (1 USD = 83 INR).' },
                originalPrice: { type: Type.NUMBER, description: 'Original/List MRP in USD ($). If no discount, set equal to price.' },
                isBestSeller: { type: Type.BOOLEAN, description: 'Whether this product is a bestseller in its category' },
                isEditorsChoice: { type: Type.BOOLEAN, description: 'Whether our editorial staff awards this a recommendation' },
                isDailyStar: { type: Type.BOOLEAN, description: 'Whether this is a featured high-discount deal' },
                overview: { type: Type.STRING, description: 'Sophisticated introductory overview of the product (1-2 paragraphs)' },
                performance: { type: Type.STRING, description: 'Detailed evaluation of real-world performance, comfort, and build quality' },
                text: { type: Type.STRING },
                verdict: { type: Type.STRING, description: 'Final expert buying verdict and justification (1 paragraph)' },
                keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 5 highlight bullet points' },
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 4 pros' },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2 to 3 cons' },
                whoShouldBuy: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2 to 3 target audiences' },
                whoShouldAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: '1 to 2 situations/users who should avoid it' },
                specifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING, description: 'Name of spec, e.g. Connectivity, Battery Life, Material' },
                      value: { type: Type.STRING, description: 'Value of spec, e.g. Bluetooth 5.3, 40 Hours, Aluminum' }
                    },
                    required: ['key', 'value']
                  }
                },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'E-commerce and search tags, e.g., ANC, Headphones, Bluetooth' },
                sizes: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Available sizes (if fashion, otherwise empty)' },
                colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'E-commerce color variants' },
                aiTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A few semantic tags for smart recommendations' },
                communityExpertSummary: { type: Type.STRING, description: '1-paragraph expert consensus summary' },
                recommendationNotes: { type: Type.STRING, description: 'Our custom buying tip, e.g., Buy during festive sales for best price.' },
                images: { type: Type.ARRAY, items: { type: Type.STRING }, description: '1 to 4 clean public e-commerce or high-quality Unsplash image URLs' }
              },
              required: ['title', 'brand', 'category', 'description', 'shortDescription', 'price', 'originalPrice']
            }
          }
        });
      }

      if (!response.text) {
        throw new Error('Gemini did not return any parseable content.');
      }

      const rawJson = response.text.trim();
      productData = JSON.parse(rawJson);

    } catch (geminiError: any) {
      console.warn('Gemini curation model hit limits/errors, falling back to premium OpenAI GPT model...', geminiError);
      
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an enterprise product intelligence engine for Alankapriya, a premium product reviews platform. Return a JSON object representing the product curation.'
            },
            {
              role: 'user',
              content: `${prompt}
              
              Note: You are running as a premium fallback model. Please analyze the URL and product details, generate outstanding original editorial reviews and specs, and return a JSON object strictly matching the schema:
              {
                "title": "string",
                "brand": "string",
                "category": "string (Audio, Mobiles, Fashion, Laptops, Wearables, Smart Home, Gaming, Accessories, Beauty)",
                "subcategory": "string",
                "description": "string (beautiful Markdown)",
                "shortDescription": "string",
                "rating": number,
                "price": number,
                "originalPrice": number,
                "isBestSeller": boolean,
                "isEditorsChoice": boolean,
                "isDailyStar": boolean,
                "overview": "string",
                "performance": "string",
                "verdict": "string",
                "keyFeatures": ["string"],
                "pros": ["string"],
                "cons": ["string"],
                "whoShouldBuy": ["string"],
                "whoShouldAvoid": ["string"],
                "specifications": [{"key": "string", "value": "string"}],
                "tags": ["string"],
                "sizes": ["string"],
                "colors": ["string"],
                "aiTags": ["string"],
                "communityExpertSummary": "string",
                "recommendationNotes": "string",
                "images": ["string"]
              }`
            }
          ],
          response_format: { type: 'json_object' }
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
          throw new Error('OpenAI returned an empty response.');
        }
        productData = JSON.parse(responseContent.trim());
        console.log('Successfully completed product curation using premium OpenAI fallback.');

      } catch (openaiError: any) {
        console.error('OpenAI fallback also failed:', openaiError);
        throw new Error(`AI Import failed. Gemini Error: ${geminiError.message}. OpenAI Fallback Error: ${openaiError.message}`);
      }
    }


    // Build specific retailer links and price inputs
    const amazonUrl = retailer.key === 'amazon' ? url : '';
    const flipkartUrl = retailer.key === 'flipkart' ? url : '';
    const myntraUrl = retailer.key === 'myntra' ? url : '';

    const payload = {
      ...productData,
      sourceUrl: url,
      retailerName: retailer.name,
      retailerKey: retailer.key,
      // Map back to specific input fields of the admin dashboard
      amazonUrlInput: amazonUrl,
      amazonPrice: retailer.key === 'amazon' ? productData.price : 0,
      flipkartUrlInput: flipkartUrl,
      flipkartPrice: retailer.key === 'flipkart' ? productData.price : 0,
      myntraUrlInput: myntraUrl,
      myntraPrice: retailer.key === 'myntra' ? productData.price : 0,
      // Add general URLs
      amazonUrl: amazonUrl,
      flipkartUrl: flipkartUrl
    };

    res.json({ success: true, product: payload });

  } catch (error: any) {
    console.error('Import engine error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze product. Please verify the URL and your Gemini API Key.' 
    });
  }
});

// Premium OpenAI Editorial Generation Endpoint
app.post('/api/openai-generate-editorial', async (req, res) => {
  const { title, brand, category, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Please provide a product title.' });
  }

  try {
    const openai = getOpenAI();

    console.log(`Generating premium OpenAI editorial content for: ${title}...`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional e-commerce copywriter specializing in luxury affiliate marketing reviews. You write sleek, SEO-optimized, engaging editorial reviews.'
        },
        {
          role: 'user',
          content: `Please generate optimized editorial copy for the following product:
          Title: ${title}
          Brand: ${brand || 'Generic'}
          Category: ${category || 'Affiliate Curation'}
          Draft Description: ${description || ''}
          
          Return a JSON object containing:
          1. "optimizedDescription": An elegant 3-paragraph SEO-friendly review in Markdown format.
          2. "hook": A punchy, attractive 1-sentence teaser (15-25 words).
          3. "pros": 3-4 professional key benefits.
          4. "cons": 2-3 honest limitations.
          5. "expertVerdict": A final professional recommendation statement.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI returned an empty response.');
    }

    const data = JSON.parse(responseContent);
    res.json({ success: true, ...data });

  } catch (error: any) {
    console.error('OpenAI generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate editorial content using OpenAI. Check your API key or configuration.' 
    });
  }
});


// Serve frontend application using Vite or static routing
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounted Vite development server middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static production files from: ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Alankapriya server running on port ${PORT}`);
  });
}

startServer();
