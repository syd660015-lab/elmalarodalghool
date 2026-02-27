
import { GoogleGenAI, Type } from "@google/genai";
import { ProsodyAnalysis, QuizQuestion, AssessmentFeedback } from "../types";

// Helper to get AI instance with latest key
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

const PROSODY_SYSTEM_INSTRUCTION = `
أنت خبير في علم العروض العربي والأدب العربي. مهمتك هي تحليل الأبيات الشعرية بدقة تامة.
يجب أن تشمل إجاباتك دائماً:
1. تشكيل البيت (تسمية الحركات).
2. تحديد البحر الشعري.
3. التقطيع العروضي (الرموز: 1 للحركة و 0 للسكون، أو - و ◡).
4. التفعيلات (مثل فعولن، مفاعيلن).
5. التأكد من سلامة الوزن وذكر أي كسر أو خطأ عروضي.
`;

export const analyzeVerse = async (verse: string): Promise<ProsodyAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `حلل هذا البيت الشعري عروضياً بدقة: "${verse}"`,
    config: {
      systemInstruction: PROSODY_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.STRING },
          diacritizedVerse: { type: Type.STRING },
          meter: { type: Type.STRING },
          scanning: { type: Type.STRING },
          feet: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          syllables: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          explanation: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN },
          errors: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["verse", "diacritizedVerse", "meter", "scanning", "feet", "explanation", "isCorrect"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generatePoem = async (topic: string, meter: string, count: number): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `اكتب ${count} أبيات من الشعر الفصيح عن "${topic}" على بحر "${meter}".`,
    config: {
      systemInstruction: "أنت شاعر مبدع متخصص في كتابة الشعر العمودي الملتزم بالوزن والقافية. تأكد أن عدد الأبيات مطابق تماماً للمطلوب.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verses: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["verses"]
      }
    }
  });

  const data = JSON.parse(response.text || '{"verses":[]}');
  return data.verses;
};

export interface CreativeSuggestions {
  themes: string[];
  imagery: string[];
  emotions: string[];
}

export const getSuggestions = async (topic: string): Promise<CreativeSuggestions> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `بناءً على موضوع الشعر "${topic}"، قدم اقتراحات إبداعية ملهمة للشاعر.`,
    config: {
      systemInstruction: "أنت مستشار إبداعي للشعراء. قدم اقتراحاتك في ثلاث فئات: ثيمات (themes)، صور بصرية (imagery)، وأحاسيس (emotions). اجعل الاقتراحات عبارات قصيرة جداً (كلمة أو كلمتين) وجذابة.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagery: { type: Type.ARRAY, items: { type: Type.STRING } },
          emotions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["themes", "imagery", "emotions"]
      }
    }
  });

  return JSON.parse(response.text || '{"themes":[], "imagery":[], "emotions":[]}');
};

export const generateQuizQuestion = async (type: 'knowledge' | 'skill', level: string): Promise<QuizQuestion> => {
  const ai = getAI();
  const prompt = type === 'knowledge' 
    ? `أنشئ سؤالاً معرفياً (اختيار من متعدد) حول قواعد علم العروض العربي لمستوى ${level}.`
    : `أنشئ سؤالاً مهارياً يتطلب تحديد البحر الشعري أو التفعيلات لبيت شعري لمستوى ${level}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `أنت معلم خبير في علم العروض. أنشئ أسئلة دقيقة وجذابة تعليمياً. 
      يجب أن يحتوي كل سؤال على حقل "hint" (تلميحة) يساعد الطالب على التفكير في الإجابة دون إعطائها له مباشرة. 
      اجعل التلميحة تركز على القاعدة العروضية أو مفتاح الحل.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          hint: { type: Type.STRING }
        },
        required: ["id", "type", "question", "correctAnswer", "explanation", "hint"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getSmartFeedback = async (question: string, userAnswer: string, correctAnswer: string): Promise<AssessmentFeedback> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `السؤال: ${question}\nإجابة المستخدم: ${userAnswer}\nالإجابة الصحيحة: ${correctAnswer}\n\nحلل الخطأ بدقة عروضية.`,
    config: {
      systemInstruction: `أنت معلم عروض يقدم تغذية راجعة ذكية ومفصلة. 
      يجب أن تتضمن الإجابة:
      1. رسالة مشجعة (message).
      2. شرح تفصيلي للقاعدة العروضية المتعلقة بالسؤال (guidance).
      3. درجة من 10 (score).
      4. توضيح لماذا كانت الإجابة الصحيحة هي الخيار الأمثل.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          message: { type: Type.STRING },
          guidance: { type: Type.STRING }
        },
        required: ["isCorrect", "score", "message", "guidance"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
