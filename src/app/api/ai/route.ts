import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const evaluationAssistSchema = z.object({
  answerText: z.string(),
  questionText: z.string(),
  answerKey: z.string().optional(),
  maxMarks: z.number(),
  questionType: z.string(),
  subject: z.string()
})

const keywordDetectionSchema = z.object({
  answerText: z.string(),
  subject: z.string(),
  keywords: z.array(z.string()).optional()
})

const similarityCheckSchema = z.object({
  text1: z.string(),
  text2: z.string(),
  threshold: z.number().optional().default(0.8)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    switch (type) {
      case 'evaluation-assist':
        return await handleEvaluationAssist(body)
      case 'keyword-detection':
        return await handleKeywordDetection(body)
      case 'similarity-check':
        return await handleSimilarityCheck(body)
      case 'missing-steps':
        return await handleMissingSteps(body)
      case 'suggested-marks':
        return await handleSuggestedMarks(body)
      default:
        return NextResponse.json(
          { error: 'Invalid AI service type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI service:', error)
    return NextResponse.json(
      { error: 'AI service error' },
      { status: 500 }
    )
  }
}

async function handleEvaluationAssist(data: any) {
  const validatedData = evaluationAssistSchema.parse(data)
  
  try {
    // Mock AI evaluation (in production, integrate with actual AI service)
    const answerLength = validatedData.answerText.length
    const hasKeyTerms = checkKeyTerms(validatedData.answerText, validatedData.subject)
    const structureScore = evaluateStructure(validatedData.answerText, validatedData.questionType)
    
    // Calculate suggested marks based on various factors
    let suggestedMarks = 0
    let feedback = []
    
    // Length and completeness (30% weight)
    if (answerLength > 100) {
      suggestedMarks += validatedData.maxMarks * 0.3
      feedback.push("Good coverage of the topic")
    } else {
      suggestedMarks += validatedData.maxMarks * 0.15
      feedback.push("Answer could be more detailed")
    }
    
    // Key terms presence (40% weight)
    if (hasKeyTerms) {
      suggestedMarks += validatedData.maxMarks * 0.4
      feedback.push("Key concepts are well addressed")
    } else {
      suggestedMarks += validatedData.maxMarks * 0.2
      feedback.push("Include more relevant key terms")
    }
    
    // Structure and organization (30% weight)
    suggestedMarks += validatedData.maxMarks * structureScore * 0.3
    if (structureScore > 0.7) {
      feedback.push("Well-structured answer")
    } else {
      feedback.push("Improve answer structure")
    }

    const result = {
      marksAwarded: Math.min(Math.floor(suggestedMarks), validatedData.maxMarks),
      feedback: feedback.join(". "),
      strengths: generateStrengths(validatedData.answerText, validatedData.subject),
      weaknesses: generateWeaknesses(validatedData.answerText, validatedData.subject),
      suggestions: generateSuggestions(validatedData.answerText, validatedData.subject),
      confidence: 0.85
    }

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Error in evaluation assist:', error)
    
    // Fallback response
    return NextResponse.json({
      success: true,
      result: {
        marksAwarded: Math.floor(validatedData.maxMarks * 0.6),
        feedback: "AI assistance unavailable. Please evaluate manually.",
        strengths: ["Question attempted"],
        weaknesses: ["Needs detailed review"],
        suggestions: ["Consult study materials", "Seek guidance"],
        confidence: 0.5
      }
    })
  }
}

async function handleKeywordDetection(data: any) {
  const validatedData = keywordDetectionSchema.parse(data)
  
  try {
    // Subject-specific keywords for CA exams
    const subjectKeywords: Record<string, string[]> = {
      ACCOUNTING: [
        'assets', 'liabilities', 'equity', 'revenue', 'expenses', 'profit', 'loss',
        'balance sheet', 'income statement', 'cash flow', 'depreciation', 'amortization',
        'accrual', 'deferral', 'contingency', 'provision', 'goodwill', 'inventory'
      ],
      LAW: [
        'contract', 'agreement', 'tort', 'crime', 'evidence', 'burden of proof',
        'consideration', 'capacity', 'legality', 'void', 'voidable', 'illegal',
        'damages', 'injunction', 'specific performance', 'breach', 'remedy'
      ],
      TAXATION: [
        'income tax', 'GST', 'tax deduction', 'exemption', 'assessment',
        'return filing', 'tax audit', 'penalty', 'interest', 'refund', 'TDS',
        'capital gains', 'business income', 'salary', 'house property'
      ],
      COSTING: [
        'cost center', 'cost unit', 'fixed cost', 'variable cost', 'break-even',
        'standard cost', 'variance analysis', 'overhead', 'labor cost', 'material cost',
        'activity based costing', 'marginal costing', 'absorption costing'
      ],
      AUDIT: [
        'audit evidence', 'materiality', 'risk assessment', 'internal control',
        'audit report', 'qualified opinion', 'adverse opinion', 'disclaimer',
        'sampling', 'verification', 'compliance', 'substantive procedures'
      ],
      FINANCIAL_MANAGEMENT: [
        'capital budgeting', 'working capital', 'cash management', 'ratio analysis',
        'cost of capital', 'NPV', 'IRR', 'payback period', 'leverage', 'solvency',
        'profitability', 'efficiency', 'market valuation'
      ]
    }

    const keywords = subjectKeywords[validatedData.subject] || []
    const answerText = validatedData.answerText.toLowerCase()
    
    const detectedKeywords = keywords.filter(keyword => 
      answerText.includes(keyword.toLowerCase())
    )

    const missingKeywords = keywords.filter(keyword => 
      !answerText.includes(keyword.toLowerCase())
    )

    const keywordScore = keywords.length > 0 ? (detectedKeywords.length / keywords.length) * 100 : 0

    return NextResponse.json({
      success: true,
      result: {
        detectedKeywords,
        missingKeywords,
        keywordScore,
        totalKeywords: keywords.length,
        coverage: keywordScore
      }
    })

  } catch (error) {
    console.error('Error in keyword detection:', error)
    return NextResponse.json({
      success: false,
      error: 'Keyword detection failed'
    })
  }
}

async function handleSimilarityCheck(data: any) {
  const validatedData = similarityCheckSchema.parse(data)
  
  try {
    // Simple text similarity calculation
    const text1Words = validatedData.text1.toLowerCase().split(/\s+/)
    const text2Words = validatedData.text2.toLowerCase().split(/\s+/)
    
    const commonWords = text1Words.filter(word => text2Words.includes(word))
    const uniqueWords1 = text1Words.filter(word => !text2Words.includes(word))
    const uniqueWords2 = text2Words.filter(word => !text1Words.includes(word))
    
    const intersection = commonWords.length
    const union = text1Words.length + text2Words.length - intersection
    
    const jaccardSimilarity = union > 0 ? intersection / union : 0
    const cosineSimilarity = calculateCosineSimilarity(text1Words, text2Words)
    
    const overallSimilarity = (jaccardSimilarity + cosineSimilarity) / 2

    return NextResponse.json({
      success: true,
      result: {
        similarity: overallSimilarity,
        jaccardSimilarity,
        cosineSimilarity,
        commonWords: commonWords.length,
        isPlagiarized: overallSimilarity > (validatedData.threshold || 0.8),
        confidence: 0.9
      }
    })

  } catch (error) {
    console.error('Error in similarity check:', error)
    return NextResponse.json({
      success: false,
      error: 'Similarity check failed'
    })
  }
}

async function handleMissingSteps(data: any) {
  try {
    const { answerText, questionText, questionType, subject } = data
    
    // Mock missing steps detection
    const missingSteps = []
    
    // Check for common steps based on question type
    if (questionType === 'PRACTICAL' || questionType === 'CASE_STUDY') {
      if (!answerText.includes('step') && !answerText.includes('first')) {
        missingSteps.push("Missing step-by-step approach")
      }
      if (!answerText.includes('conclusion') && !answerText.includes('therefore')) {
        missingSteps.push("Missing conclusion or final answer")
      }
    }
    
    if (subject === 'ACCOUNTING') {
      if (!answerText.includes('calculation') && !answerText.includes('formula')) {
        missingSteps.push("Show calculations and formulas used")
      }
    }
    
    if (subject === 'LAW') {
      if (!answerText.includes('section') && !answerText.includes('article')) {
        missingSteps.push("Cite relevant legal provisions")
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        missingSteps,
        completeness: (5 - missingSteps.length) / 5 * 100,
        suggestions: missingSteps.map(step => `Add: ${step}`)
      }
    })

  } catch (error) {
    console.error('Error in missing steps detection:', error)
    return NextResponse.json({
      success: false,
      error: 'Missing steps detection failed'
    })
  }
}

async function handleSuggestedMarks(data: any) {
  try {
    const { answerText, maxMarks, difficulty, questionType } = data
    
    // Mock suggested marks calculation
    let suggestedMarks = 0
    
    // Base marks for attempting
    suggestedMarks += maxMarks * 0.2
    
    // Length and detail
    const wordCount = answerText.split(/\s+/).length
    if (wordCount > 50) {
      suggestedMarks += maxMarks * 0.3
    } else if (wordCount > 20) {
      suggestedMarks += maxMarks * 0.2
    }
    
    // Structure and organization
    const hasStructure = answerText.includes('.') || answerText.includes('\n')
    if (hasStructure) {
      suggestedMarks += maxMarks * 0.2
    }
    
    // Content quality (mock assessment)
    suggestedMarks += maxMarks * 0.3
    
    const finalMarks = Math.min(Math.floor(suggestedMarks), maxMarks)

    return NextResponse.json({
      success: true,
      result: {
        suggestedMarks: finalMarks,
        maxMarks,
        percentage: (finalMarks / maxMarks) * 100,
        reasoning: generateMarkReasoning(answerText, maxMarks, finalMarks),
        confidence: 0.8
      }
    })

  } catch (error) {
    console.error('Error in suggested marks:', error)
    return NextResponse.json({
      success: false,
      error: 'Suggested marks calculation failed'
    })
  }
}

// Helper functions
function checkKeyTerms(answerText: string, subject: string): boolean {
  const keyTerms: Record<string, string[]> = {
    ACCOUNTING: ['assets', 'liabilities', 'profit', 'loss'],
    LAW: ['contract', 'agreement', 'legal', 'rights'],
    TAXATION: ['tax', 'income', 'deduction', 'exemption'],
    COSTING: ['cost', 'budget', 'variance', 'analysis'],
    AUDIT: ['audit', 'evidence', 'report', 'opinion'],
    FINANCIAL_MANAGEMENT: ['finance', 'investment', 'return', 'risk']
  }
  
  const terms = keyTerms[subject] || []
  const answer = answerText.toLowerCase()
  
  return terms.some(term => answer.includes(term.toLowerCase()))
}

function evaluateStructure(answerText: string, questionType: string): number {
  let score = 0.5 // Base score
  
  // Check for paragraphs
  const paragraphs = answerText.split(/\n\n/).filter(p => p.trim().length > 0)
  if (paragraphs.length > 1) score += 0.2
  
  // Check for bullet points or numbered lists
  if (answerText.includes('.') || answerText.includes('1.') || answerText.includes('-')) {
    score += 0.2
  }
  
  // Check for conclusion
  if (answerText.includes('therefore') || answerText.includes('in conclusion')) {
    score += 0.1
  }
  
  return Math.min(score, 1.0)
}

function generateStrengths(answerText: string, subject: string): string[] {
  const strengths = []
  
  if (answerText.length > 100) {
    strengths.push("Comprehensive answer")
  }
  
  if (answerText.includes('.') && answerText.split('.').length > 3) {
    strengths.push("Well-structured response")
  }
  
  if (checkKeyTerms(answerText, subject)) {
    strengths.push("Good understanding of key concepts")
  }
  
  return strengths
}

function generateWeaknesses(answerText: string, subject: string): string[] {
  const weaknesses = []
  
  if (answerText.length < 50) {
    weaknesses.push("Answer could be more detailed")
  }
  
  if (!answerText.includes('\n')) {
    weaknesses.push("Consider using paragraphs for better readability")
  }
  
  if (!checkKeyTerms(answerText, subject)) {
    weaknesses.push("Include more relevant key terms")
  }
  
  return weaknesses
}

function generateSuggestions(answerText: string, subject: string): string[] {
  const suggestions = []
  
  if (answerText.length < 100) {
    suggestions.push("Elaborate more on your points")
  }
  
  if (!answerText.includes('example')) {
    suggestions.push("Include relevant examples")
  }
  
  suggestions.push("Review the question requirements")
  suggestions.push("Practice similar questions for improvement")
  
  return suggestions
}

function calculateCosineSimilarity(words1: string[], words2: string[]): number {
  const wordFreq1: Record<string, number> = {}
  const wordFreq2: Record<string, number> = {}
  
  // Calculate word frequencies
  words1.forEach(word => {
    wordFreq1[word] = (wordFreq1[word] || 0) + 1
  })
  
  words2.forEach(word => {
    wordFreq2[word] = (wordFreq2[word] || 0) + 1
  })
  
  // Calculate dot product
  let dotProduct = 0
  const uniqueWords = new Set([...words1, ...words2])
  
  uniqueWords.forEach(word => {
    dotProduct += (wordFreq1[word] || 0) * (wordFreq2[word] || 0)
  })
  
  // Calculate magnitudes
  const magnitude1 = Math.sqrt(Object.values(wordFreq1).reduce((sum, freq) => sum + freq * freq, 0))
  const magnitude2 = Math.sqrt(Object.values(wordFreq2).reduce((sum, freq) => sum + freq * freq, 0))
  
  // Calculate cosine similarity
  return magnitude1 > 0 && magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0
}

function generateMarkReasoning(answerText: string, maxMarks: number, suggestedMarks: number): string {
  const reasons = []
  
  if (suggestedMarks >= maxMarks * 0.8) {
    reasons.push("Excellent answer with comprehensive coverage")
  } else if (suggestedMarks >= maxMarks * 0.6) {
    reasons.push("Good answer with room for improvement")
  } else if (suggestedMarks >= maxMarks * 0.4) {
    reasons.push("Satisfactory answer needing more detail")
  } else {
    reasons.push("Answer needs significant improvement")
  }
  
  const wordCount = answerText.split(/\s+/).length
  if (wordCount < 20) {
    reasons.push("Answer is too brief")
  } else if (wordCount > 100) {
    reasons.push("Good detail and coverage")
  }
  
  return reasons.join(". ")
}