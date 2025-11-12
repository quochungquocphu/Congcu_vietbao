import { GoogleGenAI, Modality } from "@google/genai";
import { type GenerationOptions, type VoiceGender, type VoiceStyle } from '../types';
import { VOICE_STYLE_INSTRUCTIONS } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ImagePart {
    mimeType: string;
    data: string;
}

export const generateJournalistContent = async (
    options: GenerationOptions,
    userInput: string,
    imagePart: ImagePart | null
): Promise<string> => {
    
    const { mode, tone, length } = options;

    const fullPrompt = `
        Với vai trò là một phóng viên báo chí chuyên nghiệp, hãy viết một tác phẩm báo chí hoàn chỉnh dựa trên các thông tin sau:
        - Loại nội dung: ${mode.toLowerCase()}
        - Phong cách thể hiện: ${tone}
        - Độ dài mong muốn: Khoảng ${length} từ.
        - Nội dung gốc: "${userInput}"

        Yêu cầu quan trọng: Chỉ trả về nội dung bài viết hoàn thiện, bao gồm Tiêu đề, Sapo (đoạn mở đầu), và nội dung chính. KHÔNG thêm bất kỳ lời dẫn, ghi chú, hay mô tả nào khác ngoài nội dung bài viết.
    `;
    
    const model = ai.models;
    
    const requestPayload = {
        model: 'gemini-2.5-pro',
        contents: imagePart
            ? { parts: [{ text: fullPrompt }, { inlineData: { mimeType: imagePart.mimeType, data: imagePart.data } }] }
            : fullPrompt,
    };
    
    const response = await model.generateContent(requestPayload);
    
    return response.text;
};


export const generateSpeech = async (
    text: string,
    gender: VoiceGender,
    style: VoiceStyle,
    lexicon: string
): Promise<string> => {
    
    let processedText = text;

    // Process custom lexicon
    if (lexicon.trim()) {
        const definitions = lexicon.split('\n').filter(line => line.includes('='));
        for (const def of definitions) {
            const [key, value] = def.split('=').map(s => s.trim());
            if (key && value) {
                // Use a regex with word boundaries to avoid replacing parts of words
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                processedText = processedText.replace(regex, value);
            }
        }
    }

    const styleInstruction = VOICE_STYLE_INSTRUCTIONS[style];
    const finalText = `${styleInstruction}: ${processedText}`;
    
    const voiceName = gender === 'male' ? 'Puck' : 'Kore'; // Puck for male, Kore for female

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: finalText }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("Không nhận được dữ liệu âm thanh từ API.");
    }
    
    return base64Audio;
};