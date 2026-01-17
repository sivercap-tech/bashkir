import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from "../constants";

export const getAIAnalysis = async (dScore: number) => {
  // Check if API key is available
  if (!process.env.API_KEY) {
    return "API Key not found. Пожалуйста, убедитесь, что переменная API_KEY установлена.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Я прошел Тест Имплицитных Ассоциаций (IAT).
      
      Структура теста:
      1. Сравнение 1: ${CATEGORIES.TARGET_A} (Русские) + ${CATEGORIES.ATTRIBUTE_B} (Коровы) против ${CATEGORIES.TARGET_B} (Башкиры) + ${CATEGORIES.ATTRIBUTE_A} (Лошади).
      2. Сравнение 2 (Реверс): ${CATEGORIES.TARGET_B} (Башкиры) + ${CATEGORIES.ATTRIBUTE_B} (Коровы) против ${CATEGORIES.TARGET_A} (Русские) + ${CATEGORIES.ATTRIBUTE_A} (Лошади).
      
      Мой D-Score: ${dScore.toFixed(3)}.
      
      Положительный D-Score означает, что я быстрее реагировал в Сравнении 1 (Русские+Коровы / Башкиры+Лошади).
      Отрицательный D-Score означает, что я быстрее реагировал в Сравнении 2 (Башкиры+Коровы / Русские+Лошади).
      
      Пожалуйста, дай краткую интерпретацию результатов на РУССКОМ ЯЗЫКЕ.
      Какие ассоциации сильнее выражены? (Например: Башкиры ассоциируются с Лошадьми, а Русские с Коровами, или наоборот).
      Тон дружелюбный, научный, без диагнозов. Максимум 3 предложения.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Не удалось получить анализ от ИИ в данный момент.";
  }
};
