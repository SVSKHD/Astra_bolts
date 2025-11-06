import { GoogleGenAI, Type } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // The result is in format "data:image/jpeg;base64,LzlqLzRBQ...". We only need the base64 part.
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const generateCaption = async (imageFile: File, suggestedFormat?: 'Photo' | 'Reel'): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const base64Image = await fileToBase64(imageFile);
        
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Image,
            },
        };

        const prompt = suggestedFormat
            ? `Based on this image, which is best suited as a social media ${suggestedFormat}, generate an engaging caption. The caption should be descriptive, evoke emotion, and end with 3-5 relevant hashtags.`
            : "Generate a catchy and engaging social media caption for this image. Include 3-5 relevant hashtags.";


        const textPart = {
            text: prompt
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating caption with Gemini:", error);
        throw new Error("Failed to generate caption. Please try again.");
    }
};


export const suggestNiches = async (): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Analyze current social media trends and suggest 5 popular and engaging content niches. Examples could be 'Vintage Tech', 'Sustainable Fashion', 'AI Art', etc. Return the result as a JSON object with a single key 'niches' which is an array of strings.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        niches: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A suggested niche.",
                            },
                            description: "An array of 5 suggested content niches."
                        },
                    },
                    required: ['niches'],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (result && Array.isArray(result.niches)) {
            return result.niches;
        } else {
            console.error("Invalid response format from API:", result);
            throw new Error("Invalid response format from API.");
        }

    } catch (error) {
        console.error("Error suggesting niches with Gemini:", error);
        throw new Error("Failed to suggest niches. Please try again.");
    }
};