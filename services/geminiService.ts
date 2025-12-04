import { GoogleGenAI, Type } from "@google/genai";
import { StrategyConfig } from "../types";

// NOTE: In a real production app, these calls might be proxied through the Python backend
// to protect the API key. For this demo, we use it directly on the client.

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    // We return null and handle it in the UI to show a warning
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const parseStrategyFromText = async (description: string): Promise<StrategyConfig> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    You are an expert algorithmic trading strategist. 
    Analyze the following trading strategy description and extract the structured configuration.
    
    Strategy Description: "${description}"
    
    If specific details (like timeframe or asset) are missing, infer reasonable defaults (e.g., EURUSD, H1, 1% risk).
    Return ONLY the JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          asset: { type: Type.STRING, description: "The trading symbol e.g., EURUSD, BTCUSD" },
          timeframe: { type: Type.STRING, description: "Timeframe e.g., M15, H1, D1" },
          entryRules: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of conditions to enter a trade" 
          },
          exitRules: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of conditions to exit a trade" 
          },
          stopLoss: { type: Type.STRING, description: "Stop loss rule" },
          takeProfit: { type: Type.STRING, description: "Take profit rule" },
          riskPerTrade: { type: Type.STRING, description: "Risk per trade e.g. 1%" }
        },
        required: ["asset", "timeframe", "entryRules", "exitRules", "stopLoss", "takeProfit", "riskPerTrade"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as StrategyConfig;
  }
  throw new Error("Failed to parse strategy");
};

export const generateBotCode = async (config: StrategyConfig, language: 'python' | 'pinescript' | 'mt5'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Generate production-ready trading bot code for the following strategy configuration.
    
    Language: ${language === 'mt5' ? 'MQL5 (MetaTrader 5)' : language === 'pinescript' ? 'Pine Script v5' : 'Python (using backtrader)'}
    
    Configuration:
    ${JSON.stringify(config, null, 2)}
    
    Include comments explaining the logic.
    Ensure standard error handling and proper syntax.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "// Failed to generate code";
};

export const generateReportNarrative = async (stats: any, config: StrategyConfig): Promise<{narrative: string, suggestions: string}> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Analyze the backtest results for this strategy.
    
    Strategy: ${JSON.stringify(config)}
    Stats: ${JSON.stringify(stats)}
    
    1. Write a professional "Executive Summary" narrative explaining the performance.
    2. Provide 3 specific "Optimization Suggestions" to improve the strategy.
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING },
          suggestions: { type: Type.STRING }
        }
      }
    }
  });

   if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("Failed to generate report");
}
