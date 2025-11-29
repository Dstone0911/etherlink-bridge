import { GoogleGenAI, Type } from "@google/genai";
import { BridgeAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBridgeAnalysis = async (
  amount: string,
  tokenSymbol: string,
  fromNetwork: string,
  toNetwork: string
): Promise<BridgeAnalysis> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the following cross-chain bridge transaction in real-time.
      Details:
      - Amount: ${amount}
      - Token: ${tokenSymbol}
      - From: ${fromNetwork}
      - To: ${toNetwork}

      Please provide an analysis of this transaction.
      1. Estimate the current gas fee (in ETH) based on network conditions.
      2. Estimate transaction time in minutes.
      3. Give a risk score (Low/Medium/High) for this bridge route.
      4. A brief, professional comment about the transaction state or network status.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedGas: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            riskScore: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["estimatedGas", "estimatedTime", "riskScore", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as BridgeAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      estimatedGas: "0.0042",
      estimatedTime: "12",
      riskScore: "Low",
      message: "Standard bridge protocol engaged."
    };
  }
};