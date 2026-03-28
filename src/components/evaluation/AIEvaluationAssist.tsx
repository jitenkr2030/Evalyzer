'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Target,
  FileText,
  Zap
} from 'lucide-react'

interface AIEvaluationAssistProps {
  questionText: string
  answerText: string
  answerKey?: string
  maxMarks: number
  questionType: string
  subject: string
  onEvaluationComplete?: (result: any) => void
}

interface AIResult {
  marksAwarded: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  confidence: number
}

interface KeywordResult {
  detectedKeywords: string[]
  missingKeywords: string[]
  keywordScore: number
  totalKeywords: number
  coverage: number
}

interface SimilarityResult {
  similarity: number
  isPlagiarized: boolean
  confidence: number
}

export function AIEvaluationAssist({
  questionText,
  answerText,
  answerKey,
  maxMarks,
  questionType,
  subject,
  onEvaluationComplete
}: AIEvaluationAssistProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('evaluation')
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [keywordResult, setKeywordResult] = useState<KeywordResult | null>(null)
  const [similarityResult, setSimilarityResult] = useState<SimilarityResult | null>(null)
  const [error, setError] = useState('')

  const handleEvaluationAssist = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'evaluation-assist',
          answerText,
          questionText,
          answerKey,
          maxMarks,
          questionType,
          subject
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'AI evaluation failed')
      }

      setAiResult(data.result)
      onEvaluationComplete?.(data.result)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI evaluation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordDetection = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'keyword-detection',
          answerText,
          subject
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Keyword detection failed')
      }

      setKeywordResult(data.result)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Keyword detection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSimilarityCheck = async () => {
    if (!answerKey) {
      setError('Answer key is required for similarity check')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'similarity-check',
          text1: answerText,
          text2: answerKey,
          threshold: 0.8
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Similarity check failed')
      }

      setSimilarityResult(data.result)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Similarity check failed')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'default'
    if (confidence >= 0.6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle>AI Evaluation Assistant</CardTitle>
          </div>
          <CardDescription>
            Get AI-powered insights and suggestions for evaluation
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="evaluation" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Evaluation
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="similarity" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Similarity
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="evaluation" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">AI-Powered Evaluation</h4>
                  <p className="text-sm text-gray-600">
                    Get intelligent evaluation suggestions based on answer quality
                  </p>
                </div>
                <Button 
                  onClick={handleEvaluationAssist}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Evaluate
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {aiResult && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold">AI Evaluation Result</h5>
                    <Badge variant={getConfidenceBadge(aiResult.confidence)}>
                      {Math.round(aiResult.confidence * 100)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-sm mb-2">Suggested Marks</h6>
                      <div className="text-2xl font-bold text-blue-600">
                        {aiResult.marksAwarded}/{maxMarks}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-sm mb-2">Score Percentage</h6>
                      <div className="text-2xl font-bold text-blue-600">
                        {((aiResult.marksAwarded / maxMarks) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-medium text-sm mb-2">Feedback</h6>
                    <p className="text-sm text-gray-700">{aiResult.feedback}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-sm mb-2">Strengths</h6>
                      <div className="space-y-1">
                        {aiResult.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-sm mb-2">Areas for Improvement</h6>
                      <div className="space-y-1">
                        {aiResult.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            <span className="text-sm">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-medium text-sm mb-2">Suggestions</h6>
                    <div className="space-y-1">
                      {aiResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-blue-500" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Keyword Detection</h4>
                  <p className="text-sm text-gray-600">
                    Identify key terms and concepts in the answer
                  </p>
                </div>
                <Button 
                  onClick={handleKeywordDetection}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Analyze
                </Button>
              </div>

              {keywordResult && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold">Keyword Analysis</h5>
                    <Badge variant="outline">
                      {keywordResult.coverage.toFixed(1)}% coverage
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-sm mb-2 text-green-700">
                        Detected Keywords ({keywordResult.detectedKeywords.length})
                      </h6>
                      <div className="flex flex-wrap gap-1">
                        {keywordResult.detectedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-sm mb-2 text-red-700">
                        Missing Keywords ({keywordResult.missingKeywords.length})
                      </h6>
                      <div className="flex flex-wrap gap-1">
                        {keywordResult.missingKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Keyword Score: {keywordResult.keywordScore.toFixed(1)}/100</p>
                    <p>Total Keywords: {keywordResult.totalKeywords}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="similarity" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Answer Similarity Check</h4>
                  <p className="text-sm text-gray-600">
                    Compare answer with model answer for similarity
                  </p>
                </div>
                <Button 
                  onClick={handleSimilarityCheck}
                  disabled={loading || !answerKey}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Check
                </Button>
              </div>

              {!answerKey && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Answer key is required for similarity check
                  </AlertDescription>
                </Alert>
              )}

              {similarityResult && (
                <div className={`space-y-4 p-4 rounded-lg ${
                  similarityResult.isPlagiarized ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold">Similarity Analysis</h5>
                    <Badge variant={similarityResult.isPlagiarized ? 'destructive' : 'default'}>
                      {similarityResult.isPlagiarized ? 'High Similarity' : 'Acceptable'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h6 className="font-medium text-sm mb-2">Similarity Score</h6>
                      <div className="text-2xl font-bold">
                        {(similarityResult.similarity * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-sm mb-2">Common Words</h6>
                      <div className="text-lg font-semibold">
                        {similarityResult.similarity > 0.5 ? 'High' : 'Low'}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-sm mb-2">Confidence</h6>
                      <div className={`text-lg font-semibold ${getConfidenceColor(similarityResult.confidence)}`}>
                        {Math.round(similarityResult.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  {similarityResult.isPlagiarized && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        High similarity detected. Please review for potential plagiarism.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional AI Features
                </h4>
                <p className="text-gray-600 mb-4">
                  More AI-powered features coming soon
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Missing steps detection</p>
                  <p>• Suggested marking scheme</p>
                  <p>• Automated rubric generation</p>
                  <p>• Performance prediction</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}