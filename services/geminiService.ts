
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ProsodyAnalysis, QuizQuestion, AssessmentFeedback } from "../types";

// Helper to get AI instance with latest key
const getAI = () => new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '');

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
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: PROSODY_SYSTEM_INSTRUCTION 
  });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: `حلل هذا البيت الشعري عروضياً بدقة: "${verse}"` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          verse: { type: SchemaType.STRING },
          diacritizedVerse: { type: SchemaType.STRING },
          meter: { type: SchemaType.STRING },
          scanning: { type: SchemaType.STRING },
          feet: { 
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          syllables: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          explanation: { type: SchemaType.STRING },
          isCorrect: { type: SchemaType.BOOLEAN },
          errors: { 
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["verse", "diacritizedVerse", "meter", "scanning", "feet", "explanation", "isCorrect", "syllables"]
      }
    }
  });

  try {
    return JSON.parse(response.response.text() || '{}');
  } catch (e) {
    console.error("Failed to parse prosody analysis:", e);
    throw new Error("فشل تحليل البيت عروضياً، حاول مرة أخرى.");
  }
};

export const generatePoem = async (topic: string, meter: string, count: number): Promise<string[]> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: "أنت شاعر مبدع متخصص في كتابة الشعر العمودي الملتزم بالوزن والقافية. تأكد أن عدد الأبيات مطابق تماماً للمطلوب."
  });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: `اكتب ${count} أبيات من الشعر الفصيح عن "${topic}" على بحر "${meter}".` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          verses: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["verses"]
      }
    }
  });

  try {
    const data = JSON.parse(response.response.text() || '{"verses":[]}');
    return data.verses || [];
  } catch (e) {
    console.error("Failed to parse poem response:", e);
    return [];
  }
};

export interface CreativeSuggestions {
  themes: string[];
  imagery: string[];
  emotions: string[];
}

export const getSuggestions = async (topic: string): Promise<CreativeSuggestions> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: "أنت مستشار إبداعي للشعراء. قدم اقتراحاتك في ثلاث فئات: ثيمات (themes)، صور بصرية (imagery)، وأحاسيس (emotions). اجعل الاقتراحات عبارات شاعرية ملهمة ومفصلة قليلاً (من 3 إلى 5 كلمات) بدلاً من كلمات مفردة."
  });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: `بناءً على موضوع الشعر "${topic}"، قدم اقتراحات إبداعية ملهمة للشاعر.` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          themes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          imagery: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          emotions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["themes", "imagery", "emotions"]
      }
    }
  });

  try {
    return JSON.parse(response.response.text() || '{"themes":[], "imagery":[], "emotions":[]}');
  } catch (e) {
    console.error("Failed to parse suggestions:", e);
    return { themes: [], imagery: [], emotions: [] };
  }
};

export const generateQuizQuestion = async (type: 'knowledge' | 'skill', level: string): Promise<QuizQuestion> => {
  const ai = getAI();
  const prompt = type === 'knowledge' 
    ? `أنشئ سؤالاً معرفياً (اختيار من متعدد) حول قواعد علم العروض العربي لمستوى ${level}.`
    : `أنشئ سؤالاً مهارياً يتطلب تحديد البحر الشعري أو التفعيلات لبيت شعري لمستوى ${level}.`;

  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: `أنت معلم خبير في علم العروض. أنشئ أسئلة دقيقة وجذابة تعليمياً. 
      يجب أن يحتوي كل سؤال على حقل "hint" (تلميحة) يساعد الطالب على التفكير في الإجابة دون إعطائها له مباشرة. 
      اجعل التلميحة تركز على القاعدة العروضية أو مفتاح الحل.`
  });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
          options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          correctAnswer: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          hint: { type: SchemaType.STRING }
        },
        required: ["id", "type", "question", "correctAnswer", "explanation", "hint"]
      }
    }
  });

  try {
    return JSON.parse(response.response.text() || '{}');
  } catch (e) {
    console.error("Failed to parse quiz question:", e);
    throw new Error("فشل توليد السؤال، حاول مرة أخرى.");
  }
};

export const getSmartFeedback = async (question: string, userAnswer: string, correctAnswer: string): Promise<AssessmentFeedback> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: `أنت معلم عروض يقدم تغذية راجعة ذكية ومفصلة. 
      يجب أن تتضمن الإجابة:
      1. رسالة مشجعة (message).
      2. شرح تفصيلي للقاعدة العروضية المتعلقة بالسؤال (guidance).
      3. درجة من 10 (score).
      4. توضيح لماذا كانت الإجابة الصحيحة هي الخيار الأمثل.`
  });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: `السؤال: ${question}\nإجابة المستخدم: ${userAnswer}\nالإجابة الصحيحة: ${correctAnswer}\n\nحلل الخطأ بدقة عروضية.` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          isCorrect: { type: SchemaType.BOOLEAN },
          score: { type: SchemaType.NUMBER },
          message: { type: SchemaType.STRING },
          guidance: { type: SchemaType.STRING }
        },
        required: ["isCorrect", "score", "message", "guidance"]
      }
    }
  });

  try {
    return JSON.parse(response.response.text() || '{}');
  } catch (e) {
    console.error("Failed to parse smart feedback:", e);
    return {
      isCorrect: userAnswer === correctAnswer,
      score: userAnswer === correctAnswer ? 10 : 0,
      message: userAnswer === correctAnswer ? "إجابة صحيحة!" : "إجابة خاطئة، حاول فهم القاعدة العروضية.",
      guidance: `الإجابة الصحيحة كانت: ${correctAnswer}`
    };
  }
};
