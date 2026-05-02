import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MLPriorityScore, Priority } from '../types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Intelligent AI Priority Engine
 * Uses Google Gemini to classify complaints with human-like understanding
 */

export const mlPrioritize = async (
  category: string,
  subject: string,
  description: string,
  isAbusive: boolean
): Promise<{ priority: Priority; mlScore: MLPriorityScore }> => {
  
  const fullText = `Category: ${category}\nSubject: ${subject}\nDescription: ${description}`;
  
  try {
    const prompt = `
      You are an AI Grievance Classifier for ZCOER College. 
      Analyze this student complaint and provide a JSON response.
      
      Complaint:
      "${fullText}"
      
      Rules:
      1. Priority must be: "Critical", "High", "Medium", or "Low".
      2. Set to "Critical" if there is ANY mention of: Ragging, Sexual Harassment, Physical Assault, Rape, Suicide, or Weapons.
      3. Set to "High" for: Extreme bullying, Academic failure threats, Security breaches, or Total infrastructure failure (No water/electricity).
      4. Set to "Medium" for: General delays, minor equipment issues, or routine academic concerns.
      5. Set to "Low" for: General feedback or suggestions.
      6. "sentiment": 0-100 (100 is extremely distressed/angry).
      7. "urgency": 0-100 (100 is immediate action needed).
      8. "impact": 0-100 (100 affects many students).
      
      Return ONLY this JSON format:
      {
        "priority": "...",
        "sentiment": 80,
        "urgency": 90,
        "impact": 50,
        "reasoning": "Brief explanation"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    const mlScore: MLPriorityScore = {
      urgencyScore: aiData.urgency,
      frequencyScore: 50,
      impactScore: aiData.impact,
      sentimentScore: aiData.sentiment,
      finalScore: (aiData.urgency + aiData.sentiment + aiData.impact) / 3,
      reasoning: aiData.reasoning,
      fairnessFlag: false
    };

    return { 
      priority: isAbusive ? 'High' : aiData.priority, 
      mlScore 
    };

  } catch (error) {
    console.error("Gemini AI failed, falling back to keywords:", error);
    // Fallback to simple logic if AI fails (e.g. quota exceeded)
    const lower = fullText.toLowerCase();
    let priority: Priority = 'Low';
    
    if (lower.includes('rape') || lower.includes('ragging') || lower.includes('assault')) priority = 'Critical';
    else if (lower.includes('urgent') || lower.includes('broken')) priority = 'High';
    else if (lower.includes('problem')) priority = 'Medium';

    return { 
      priority, 
      mlScore: {
        urgencyScore: 50,
        frequencyScore: 50,
        impactScore: 50,
        sentimentScore: 50,
        finalScore: 50,
        reasoning: "AI analysis unavailable. Standard fallback applied.",
        fairnessFlag: false
      }
    };
  }
};

/**
 * Detect abusive content using pattern matching
 */
export const detectAbuse = (text: string): boolean => {
  const abuseKeywords = [
    'idiot', 'stupid', 'moron', 'fool', 'damn', 'hell', 'ass', 'bastard',
    'fuck', 'shit', 'bitch', 'dick', 'piss', 'bastard', 'crap'
  ];
  const lower = text.toLowerCase();
  return abuseKeywords.some(kw => lower.includes(kw));
};
