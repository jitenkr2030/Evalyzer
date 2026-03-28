'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BarChart3,
  PieChart,
  Calendar,
  Clock
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

interface PerformanceAnalyticsProps {
  data: AnalyticsData
}

export function PerformanceAnalytics({ data }: PerformanceAnalyticsProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <div className="w-4 h-4" />
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      ACCOUNTING: 'bg-blue-100 text-blue-800',
      LAW: 'bg-green-100 text-green-800',
      TAXATION: 'bg-purple-100 text-purple-800',
      COSTING: 'bg-orange-100 text-orange-800',
      AUDIT: 'bg-red-100 text-red-800',
      FINANCIAL_MANAGEMENT: 'bg-indigo-100 text-indigo-800',
      ECONOMICS: 'bg-yellow-100 text-yellow-800',
      ETHICS: 'bg-pink-100 text-pink-800',
      IT_SM: 'bg-gray-100 text-gray-800',
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageScore.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(data.overview.improvementTrend)}
              <span>{data.overview.improvementTrend > 0 ? '+' : ''}{data.overview.improvementTrend}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{data.overview.currentRank}</div>
            <p className="text-xs text-muted-foreground">
              Out of {data.airSimulation.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentile</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.percentile.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Better than most students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalExams > 0 
                ? ((data.overview.completedExams / data.overview.totalExams) * 100).toFixed(0)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overview.completedExams}/{data.overview.totalExams} exams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="air-simulation">AIR Simulation</TabsTrigger>
          <TabsTrigger value="subject-wise">Subject Wise</TabsTrigger>
          <TabsTrigger value="recent">Recent Results</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Your average accuracy by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.performance.subjectStats.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject.subject}</span>
                        <span className="text-sm text-gray-600">{subject.avgAccuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={subject.avgAccuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Areas</CardTitle>
                <CardDescription>Focus areas to enhance your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Areas to Improve</h4>
                    <div className="space-y-2">
                      {data.performance.improvementAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {data.performance.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="air-simulation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AIR Ranking</CardTitle>
                <CardDescription>Your All India Rank simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      #{data.airSimulation.currentRank}
                    </div>
                    <p className="text-gray-600">
                      Percentile: {data.airSimulation.percentile.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Subject-wise Ranks</h4>
                    <div className="space-y-2">
                      {Object.entries(data.airSimulation.subjectRanks).map(([subject, rank]) => (
                        <div key={subject} className="flex justify-between items-center">
                          <span className="text-sm">{subject}</span>
                          <div className="text-right">
                            <span className="font-medium">#{rank.rank}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({rank.percentile.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rank Predictions</CardTitle>
                <CardDescription>AI-powered rank predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Next Exam Rank</span>
                      <span className="text-blue-600 font-bold">#{data.airSimulation.predictions.nextExamRank}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Final Exam Rank</span>
                      <span className="text-green-600 font-bold">#{data.airSimulation.predictions.finalRank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Confidence</span>
                      <span className="text-gray-600">{data.airSimulation.predictions.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>These predictions are based on your current performance trends and improvement patterns.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subject-wise" className="space-y-4">
          <div className="grid gap-6">
            {data.subjectWise.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getSubjectColor(subject.subject)}>
                        {subject.subject}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(subject.trend === 'improving' ? 5 : -5)}
                        <span className="text-sm text-gray-600 capitalize">
                          {subject.trend}
                        </span>
                      </div>
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{subject.average.toFixed(1)}%</div>
                      <p className="text-sm text-gray-600">
                        {subject.totalScore}/{subject.totalMarks} marks
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={subject.average} className="h-2" />
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recent Performance</h4>
                      <div className="space-y-2">
                        {subject.exams.slice(0, 3).map((exam) => (
                          <div key={exam.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {new Date(exam.date).toLocaleDateString()}
                            </span>
                            <span className={getScoreColor(exam.percentage)}>
                              {exam.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {data.recentResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{result.examTitle}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSubjectColor(result.subject)}>
                          {result.subject}
                        </Badge>
                        <Badge variant="outline">{result.caLevel}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(result.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Rank #{result.rank}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1">
                        <span className={getScoreColor(result.percentage)}>
                          {result.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {result.score}/{result.totalMarks}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}