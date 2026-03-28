'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Download,
  Calendar
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalExams: number
    completedExams: number
    averageScore: number
    currentRank: number
    percentile: number
    improvementTrend: number
  }
  recentResults: Array<{
    id: string
    examTitle: string
    subject: string
    caLevel: string
    score: number
    totalMarks: number
    percentage: number
    rank: number
    date: string
  }>
  performance: {
    subjectStats: Array<{
      subject: string
      avgAccuracy: number
      avgTime: number
      strengthAreas: string[]
      weakAreas: string[]
    }>
    overallAccuracy: number
    improvementAreas: string[]
    recommendations: string[]
  }
  airSimulation: {
    currentRank: number
    percentile: number
    totalStudents: number
    scoreDistribution: Array<{
      rank: number
      score: string
      isYou: boolean
    }>
    subjectRanks: Record<string, { rank: number; percentile: number }>
    predictions: {
      nextExamRank: number
      finalRank: number
      confidence: number
    }
  }
  subjectWise: Array<{
    subject: string
    exams: Array<{
      id: string
      score: number
      totalMarks: number
      percentage: number
      date: string
    }>
    totalScore: number
    totalMarks: number
    average: number
    trend: string
  }>
}

export default function StudentAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  const [analyticsType, setAnalyticsType] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin')
      return
    }

    fetchAnalytics()
  }, [session, status, router, timeRange, analyticsType])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        type: analyticsType,
        timeRange
      })

      const response = await fetch(`/api/analytics?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/student">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-gray-600">
                  Track your progress and improve your performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {analyticsData ? (
          <PerformanceAnalytics data={analyticsData} />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Analytics Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                Start taking exams to see your performance analytics here
              </p>
              <Button asChild>
                <Link href="/dashboard/student/exams">
                  Browse Exams
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}