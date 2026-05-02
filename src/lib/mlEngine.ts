import type { Complaint, MLPriorityScore, Priority, Category } from '../types';
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
  critical: ['harass', 'assault', 'threat', 'unsafe', 'danger', 'emergency', 'violence', 'abuse', 'fire', 'injury', 'medical', 'accident'],
  high: ['urgent', 'immediate', 'exam', 'deadline', 'broken', 'fail', 'not working', 'no water', 'no electricity', 'leaking', 'flooding'],
  medium: ['issue', 'problem', 'concern', 'delay', 'missing', 'unavailable', 'poor', 'insufficient'],
  low: ['suggestion', 'feedback', 'improve', 'request', 'would be nice', 'prefer'],
};

/**
 * Sentiment scoring using keyword analysis
 */
const analyzeSentiment = (text: string): number => {
  const lower = text.toLowerCase();
  let score = 30; // baseline

  URGENCY_KEYWORDS.critical.forEach(kw => { if (lower.includes(kw)) score += 25; });
  URGENCY_KEYWORDS.high.forEach(kw => { if (lower.includes(kw)) score += 15; });
  URGENCY_KEYWORDS.medium.forEach(kw => { if (lower.includes(kw)) score += 5; });
  URGENCY_KEYWORDS.low.forEach(kw => { if (lower.includes(kw)) score -= 5; });

  // Text length and complexity
  if (text.length > 300) score += 10;
  if (text.includes('!')) score += 5;
  if (text.toUpperCase() === text && text.length > 20) score += 10;

  return Math.min(100, Math.max(0, score));
};

/**
 * Frequency scoring - how many similar complaints exist
 */
const analyzeFrequency = async (category: string, subject: string): Promise<number> => {
  const allComplaints = await storage.getComplaints();
  const similar = allComplaints.filter(c => 
    c.category === category && 
    c.status !== 'Resolved' &&
    (c.subject.toLowerCase().split(' ').some(word => 
      word.length > 4 && subject.toLowerCase().includes(word)
    ))
  );
  
  // More similar unresolved complaints = higher frequency score
  const rawScore = Math.min(similar.length * 20, 100);
  return rawScore;
};

/**
 * Urgency scoring based on category and keywords
 */
const analyzeUrgency = (category: string, description: string): number => {
  const categoryScore = CATEGORY_URGENCY[category] || 50;
  const lower = description.toLowerCase();
  
  let bonusScore = 0;
  URGENCY_KEYWORDS.critical.forEach(kw => { if (lower.includes(kw)) bonusScore += 20; });
  URGENCY_KEYWORDS.high.forEach(kw => { if (lower.includes(kw)) bonusScore += 10; });

  return Math.min(100, categoryScore + bonusScore);
};

/**
 * Impact scoring - estimated number of students affected
 */
const analyzeImpact = (description: string, category: string): number => {
  const lower = description.toLowerCase();
  let score = 30;
  
  // Collective reports
  if (lower.includes('all student') || lower.includes('everyone')) score += 40;
  if (lower.includes('many student') || lower.includes('multiple')) score += 25;
  if (lower.includes('our class') || lower.includes('whole batch')) score += 20;
  
  // High-impact categories
  if (['Security', 'Hostel', 'Electricity', 'Transport'].includes(category)) score += 15;
  
  return Math.min(100, score);
};

/**
 * Fairness analysis - checks if priority assignment is consistent
 * with historical patterns for similar complaints
 */
const checkFairness = async (category: string, computedScore: number): Promise<boolean> => {
  const allComplaints = await storage.getComplaints();
  const sameCategory = allComplaints.filter(c => c.category === category);
  
  if (sameCategory.length < 3) return false; // Not enough data
  
  const avgScoreForCategory = sameCategory.reduce((acc, c) => {
    return acc + (c.mlScore?.finalScore || 50);
  }, 0) / sameCategory.length;
  
  // Flag if this complaint score deviates significantly (fairness concern)
  const deviation = Math.abs(computedScore - avgScoreForCategory);
  return deviation > 30;
};

/**
 * Convert numerical score to priority label
 */
const scoreToPriority = (score: number): Priority => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
};

/**
 * Main ML Prioritization Function
 * Returns both priority label and detailed ML score breakdown
 */
export const mlPrioritize = async (
  category: string,
  subject: string,
  description: string,
  isAbusive: boolean
): Promise<{ priority: Priority; mlScore: MLPriorityScore }> => {
  
  const urgencyScore = analyzeUrgency(category, description);
  const frequencyScore = await analyzeFrequency(category, subject);
  const impactScore = analyzeImpact(description, category);
  const sentimentScore = analyzeSentiment(description);
  
  // Weighted composite (weights reflect stakeholder priorities)
  const finalScore = (
    urgencyScore * 0.35 +    // Urgency is most important
    sentimentScore * 0.25 +  // Emotional intensity matters
    impactScore * 0.25 +     // Student impact
    frequencyScore * 0.15    // Historical frequency
  );
  
  const fairnessFlag = await checkFairness(category, finalScore);
  const priority = isAbusive ? 'High' : scoreToPriority(finalScore); // Abusive complaints get auto-High
  
  const reasoning = isAbusive
    ? 'Policy violation detected. Priority escalated to High for review. Anonymous protection void.'
    : `Score: ${finalScore.toFixed(0)}/100 | Urgency: ${urgencyScore.toFixed(0)}, Impact: ${impactScore.toFixed(0)}, Frequency: ${frequencyScore.toFixed(0)}, Sentiment: ${sentimentScore.toFixed(0)}`;

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
 */
export const detectAbuse = (text: string): boolean => {
  const abuseKeywords = [
    'idiot', 'stupid', 'moron', 'fool', 'damn', 'hell', 'ass', 'bastard',
    'corrupt', 'useless', 'pathetic', 'nonsense', 'cheat', 'fraud', 'liar'
  ];
  const lower = text.toLowerCase();
  return abuseKeywords.some(kw => lower.includes(kw));
};
