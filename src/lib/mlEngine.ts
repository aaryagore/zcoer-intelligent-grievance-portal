import type { MLPriorityScore, Priority } from '../types';
import { storage } from './storage';

/**
 * Intelligent ML Priority Engine
 * Uses weighted multi-factor scoring to determine complaint priority
 * under conflicting stakeholder constraints
 */

// Category urgency weights (domain knowledge)
const CATEGORY_URGENCY: Record<string, number> = {
  'Security': 95,
  'Hostel': 80,
  'Electricity': 75,
  'Transport': 70,
  'Student Issue': 65,
  'IT': 60,
  'Academics': 55,
  'Campus': 50,
  'Mess': 45,
  'Administration': 40,
};

// Urgency keyword patterns
const URGENCY_KEYWORDS = {
  critical: [
    'rape', 'ragging', 'sexual', 'assault', 'harass', 'threat', 'unsafe', 
    'danger', 'emergency', 'violence', 'abuse', 'fire', 'injury', 
    'medical', 'accident', 'suicide', 'self-harm', 'weapon', 'gun', 'knife'
  ],
  high: [
    'urgent', 'immediate', 'exam', 'deadline', 'broken', 'fail', 
    'not working', 'no water', 'no electricity', 'leaking', 'flooding',
    'theft', 'stolen', 'robbery', 'bullying', 'mental health'
  ],
  medium: ['issue', 'problem', 'concern', 'delay', 'missing', 'unavailable', 'poor', 'insufficient'],
  low: ['suggestion', 'feedback', 'improve', 'request', 'would be nice', 'prefer'],
};

/**
 * Sentiment scoring using keyword analysis
 */
const analyzeSentiment = (text: string): number => {
  const lower = text.toLowerCase();
  let score = 40; // Higher baseline for better sensitivity

  URGENCY_KEYWORDS.critical.forEach(kw => { if (lower.includes(kw)) score += 40; });
  URGENCY_KEYWORDS.high.forEach(kw => { if (lower.includes(kw)) score += 20; });
  URGENCY_KEYWORDS.medium.forEach(kw => { if (lower.includes(kw)) score += 5; });
  URGENCY_KEYWORDS.low.forEach(kw => { if (lower.includes(kw)) score -= 10; });

  return Math.min(100, Math.max(0, score));
};

/**
 * Frequency scoring - how many similar complaints exist
 */
const analyzeFrequency = async (category: string, fullText: string): Promise<number> => {
  try {
    const allComplaints = await storage.getComplaints();
    const similar = allComplaints.filter(c => 
      c.category === category && 
      c.status !== 'Resolved' &&
      (fullText.toLowerCase().includes(c.subject.toLowerCase()))
    );
    
    return Math.min(similar.length * 25, 100);
  } catch (error) {
    return 0;
  }
};

/**
 * Urgency scoring based on category and keywords
 */
const analyzeUrgency = (category: string, fullText: string): number => {
  const lower = fullText.toLowerCase();
  
  // ABSOLUTE OVERRIDE: If any critical keyword is found, urgency is 100%
  const hasCritical = URGENCY_KEYWORDS.critical.some(kw => lower.includes(kw));
  if (hasCritical) return 100;

  const categoryScore = CATEGORY_URGENCY[category] || 50;
  let bonusScore = 0;
  URGENCY_KEYWORDS.high.forEach(kw => { if (lower.includes(kw)) bonusScore += 20; });

  return Math.min(100, categoryScore + bonusScore);
};

/**
 * Impact scoring - estimated number of students affected
 */
const analyzeImpact = (fullText: string, category: string): number => {
  const lower = fullText.toLowerCase();
  let score = 30;
  
  if (lower.includes('all') || lower.includes('everyone') || lower.includes('group')) score += 40;
  if (lower.includes('class') || lower.includes('batch') || lower.includes('hostel')) score += 25;
  
  if (['Security', 'Hostel', 'Electricity', 'Transport'].includes(category)) score += 20;
  
  return Math.min(100, score);
};

/**
 * Convert numerical score to priority label
 */
const scoreToPriority = (score: number, fullText: string): Priority => {
  const lower = fullText.toLowerCase();
  
  // SAFETY OVERRIDE: Absolute Critical for safety red flags
  const hasSafetyRisk = URGENCY_KEYWORDS.critical.some(kw => lower.includes(kw));
  if (hasSafetyRisk) return 'Critical';

  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

/**
 * Main ML Prioritization Function
 */
export const mlPrioritize = async (
  category: string,
  subject: string,
  description: string,
  isAbusive: boolean
): Promise<{ priority: Priority; mlScore: MLPriorityScore }> => {
  
  const fullText = `${subject} ${description}`.toLowerCase();
  
  const urgencyScore = analyzeUrgency(category, fullText);
  const frequencyScore = await analyzeFrequency(category, fullText);
  const impactScore = analyzeImpact(fullText, category);
  const sentimentScore = analyzeSentiment(fullText);
  
  // Final composite score
  const finalScore = (
    urgencyScore * 0.50 +    // Increased urgency weight for safety
    sentimentScore * 0.20 +  
    impactScore * 0.20 +     
    frequencyScore * 0.10    
  );
  
  const fairnessFlag = await checkFairness(category, finalScore);
  const priority = isAbusive ? 'High' : scoreToPriority(finalScore, fullText);
  
  const reasoning = isAbusive
    ? 'Policy violation: Abusive language detected. Priority escalated. Identity disclosed.'
    : `ML Engine: Detected ${urgencyScore === 100 ? 'CRITICAL SAFETY RISK' : 'Standard complaint'}. Final priority: ${priority}.`;

  const mlScore: MLPriorityScore = {
    urgencyScore,
    frequencyScore,
    impactScore,
    sentimentScore,
    finalScore,
    reasoning,
    fairnessFlag
  };

  return { priority, mlScore };
};

/**
 * Detect abusive content using pattern matching
 * Includes common profanity and unprofessional language
 */
export const detectAbuse = (text: string): boolean => {
  const abuseKeywords = [
    // Mild/Unprofessional
    'idiot', 'stupid', 'moron', 'fool', 'damn', 'hell', 'ass', 'bastard',
    'corrupt', 'useless', 'pathetic', 'nonsense', 'cheat', 'fraud', 'liar',
    // Strong/Abusive (Masked here for code safety but recognized by engine)
    'fuck', 'shit', 'bitch', 'dick', 'piss', 'bastard', 'crap'
  ];
  const lower = text.toLowerCase();
  return abuseKeywords.some(kw => lower.includes(kw));
};
