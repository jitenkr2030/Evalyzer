import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const examId = searchParams.get('examId')
    const timeRange = searchParams.get('timeRange') || '30d'

    if (user.role === 'STUDENT') {
      return await getStudentAnalytics(user.id, type, examId, timeRange)
    } else if (user.role === 'EVALUATOR') {
      return await getEvaluatorAnalytics(user.id, type, timeRange)
    } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return await getAdminAnalytics(type, timeRange)
    }

    return NextResponse.json(
      { error: 'Invalid user role' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getStudentAnalytics(userId: string, type: string, examId?: string, timeRange?: string) {
  const student = await db.student.findUnique({
    where: { userId }
  })

  if (!student) {
    throw new Error('Student profile not found')
  }

  switch (type) {
    case 'overview':
      return await getStudentOverview(student.id, timeRange)
    case 'performance':
      return await getStudentPerformance(student.id)
    case 'air-simulation':
      return await getStudentAIRSimulation(student.id, examId)
    case 'subject-wise':
      return await getStudentSubjectWise(student.id)
    default:
      throw new Error('Invalid analytics type')
  }
}

async function getStudentOverview(studentId: string, timeRange?: string) {
  // Calculate date range
  const days = parseInt(timeRange?.replace('d', '') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalExams, completedExams, averageScore, recentResults] = await Promise.all([
    db.examEnrollment.count({
      where: {
        studentId,
        enrolledAt: {
          gte: startDate
        }
      }
    }),
    db.examResult.count({
      where: {
        studentId,
        createdAt: {
          gte: startDate
        }
      }
    }),
    db.examResult.aggregate({
      where: {
        studentId,
        createdAt: {
          gte: startDate
        }
      },
      _avg: {
        percentage: true
      }
    }),
    db.examResult.findMany({
      where: {
        studentId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        exam: {
          select: {
            title: true,
            subject: true,
            caLevel: true,
            totalMarks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Calculate current rank and percentile (mock data for now)
  const currentRank = 15
  const totalStudents = 150
  const percentile = ((totalStudents - currentRank) / totalStudents) * 100

  return {
    overview: {
      totalExams,
      completedExams,
      averageScore: averageScore._avg.percentage || 0,
      currentRank,
      percentile,
      improvementTrend: 2.5 // Mock data
    },
    recentResults: recentResults.map(result => ({
      id: result.id,
      examTitle: result.exam.title,
      subject: result.exam.subject,
      caLevel: result.exam.caLevel,
      score: result.totalMarks,
      totalMarks: result.exam.totalMarks,
      percentage: result.percentage,
      rank: Math.floor(Math.random() * 50) + 1, // Mock rank
      date: result.createdAt
    }))
  }
}

async function getStudentPerformance(studentId: string) {
  // Get performance analytics
  const analytics = await db.performanceAnalytics.findMany({
    where: { studentId },
    orderBy: { analyticsDate: 'desc' },
    take: 50
  })

  // Group by subject
  const subjectPerformance = analytics.reduce((acc, analytic) => {
    if (!acc[analytic.subject]) {
      acc[analytic.subject] = {
        subject: analytic.subject,
        accuracy: [],
        avgTime: [],
        strengthAreas: [],
        weakAreas: []
      }
    }
    acc[analytic.subject].accuracy.push(analytic.accuracy)
    if (analytic.avgTimePerQuestion) {
      acc[analytic.subject].avgTime.push(analytic.avgTimePerQuestion)
    }
    return acc
  }, {} as any)

  // Calculate averages for each subject
  const subjectStats = Object.values(subjectPerformance).map((subject: any) => ({
    subject: subject.subject,
    avgAccuracy: subject.accuracy.reduce((a: number, b: number) => a + b, 0) / subject.accuracy.length,
    avgTime: subject.avgTime.length > 0 ? subject.avgTime.reduce((a: number, b: number) => a + b, 0) / subject.avgTime.length : 0,
    strengthAreas: ['Conceptual understanding', 'Problem solving'], // Mock data
    weakAreas: ['Time management', 'Presentation'] // Mock data
  }))

  return {
    performance: {
      subjectStats,
      overallAccuracy: subjectStats.reduce((sum, stat) => sum + stat.avgAccuracy, 0) / subjectStats.length,
      improvementAreas: ['Practice more numerical problems', 'Improve presentation skills'],
      recommendations: ['Focus on time management', 'Review weak topics regularly']
    }
  }
}

async function getStudentAIRSimulation(studentId: string, examId?: string) {
  // Mock AIR simulation data
  const allStudents = 150
  const yourScore = 75
  const scores = Array.from({ length: allStudents }, () => Math.random() * 100)
  scores.push(yourScore)
  scores.sort((a, b) => b - a)
  
  const yourRank = scores.indexOf(yourScore) + 1
  const percentile = ((allStudents - yourRank) / allStudents) * 100

  return {
    airSimulation: {
      currentRank: yourRank,
      percentile,
      totalStudents: allStudents,
      scoreDistribution: scores.map((score, index) => ({
        rank: index + 1,
        score: score.toFixed(2),
        isYou: score === yourScore
      })),
      subjectRanks: {
        ACCOUNTING: { rank: 12, percentile: 92 },
        LAW: { rank: 18, percentile: 88 },
        TAXATION: { rank: 22, percentile: 85 }
      },
      predictions: {
        nextExamRank: yourRank - 2,
        finalRank: yourRank - 5,
        confidence: 85
      }
    }
  }
}

async function getStudentSubjectWise(studentId: string) {
  const results = await db.examResult.findMany({
    where: { studentId },
    include: {
      exam: {
        select: {
          subject: true,
          totalMarks: true
        }
      }
    }
  })

  // Group by subject
  const subjectData = results.reduce((acc, result) => {
    const subject = result.exam.subject
    if (!acc[subject]) {
      acc[subject] = {
        subject,
        exams: [],
        totalScore: 0,
        totalMarks: 0,
        average: 0,
        trend: 'improving' // Mock trend
      }
    }
    acc[subject].exams.push({
      id: result.id,
      score: result.totalMarks,
      totalMarks: result.exam.totalMarks,
      percentage: result.percentage,
      date: result.createdAt
    })
    acc[subject].totalScore += result.totalMarks
    acc[subject].totalMarks += result.exam.totalMarks
    return acc
  }, {} as any)

  // Calculate averages
  Object.values(subjectData).forEach((subject: any) => {
    subject.average = (subject.totalScore / subject.totalMarks) * 100
  })

  return {
    subjectWise: Object.values(subjectData)
  }
}

async function getEvaluatorAnalytics(userId: string, type: string, timeRange?: string) {
  const evaluator = await db.evaluator.findUnique({
    where: { userId }
  })

  if (!evaluator) {
    throw new Error('Evaluator profile not found')
  }

  switch (type) {
    case 'overview':
      return await getEvaluatorOverview(evaluator.id, timeRange)
    case 'performance':
      return await getEvaluatorPerformance(evaluator.id)
    default:
      throw new Error('Invalid analytics type')
  }
}

async function getEvaluatorOverview(evaluatorId: string, timeRange?: string) {
  const days = parseInt(timeRange?.replace('d', '') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalEvaluations, completedEvaluations, avgTime, earnings] = await Promise.all([
    db.evaluation.count({
      where: {
        evaluatorId,
        assignedAt: {
          gte: startDate
        }
      }
    }),
    db.evaluation.count({
      where: {
        evaluatorId,
        status: 'COMPLETED',
        completedAt: {
          gte: startDate
        }
      }
    }),
    db.evaluation.aggregate({
      where: {
        evaluatorId,
        status: 'COMPLETED',
        completedAt: {
          gte: startDate
        }
      },
      _avg: {
        timeSpent: true
      }
    }),
    db.evaluatorPayment.aggregate({
      where: {
        evaluatorId,
        status: 'PROCESSED',
        processedAt: {
          gte: startDate
        }
      },
      _sum: {
        totalAmount: true
      }
    })
  ])

  return {
    overview: {
      totalEvaluations,
      completedEvaluations,
      pendingEvaluations: totalEvaluations - completedEvaluations,
      avgTimePerCopy: avgTime._avg.timeSpent || 0,
      totalEarnings: earnings._sum.totalAmount || 0,
      rating: 4.7, // Mock data
      efficiency: 85 // Mock data
    }
  }
}

async function getEvaluatorPerformance(evaluatorId: string) {
  const evaluations = await db.evaluation.findMany({
    where: {
      evaluatorId,
      status: 'COMPLETED'
    },
    include: {
      answerSheet: {
        include: {
          exam: {
            select: {
              subject: true,
              caLevel: true
            }
          }
        }
      }
    },
    orderBy: { completedAt: 'desc' },
    take: 100
  })

  // Group by subject
  const subjectPerformance = evaluations.reduce((acc, evaluation) => {
    const subject = evaluation.answerSheet.exam.subject
    if (!acc[subject]) {
      acc[subject] = {
        subject,
        count: 0,
        totalTime: 0,
        avgScore: 0
      }
    }
    acc[subject].count += 1
    acc[subject].totalTime += evaluation.timeSpent || 0
    acc[subject].avgScore += (evaluation.totalMarks || 0) / (evaluation.maxMarks || 1) * 100
    return acc
  }, {} as any)

  // Calculate averages
  Object.values(subjectPerformance).forEach((subject: any) => {
    subject.avgTime = subject.totalTime / subject.count
    subject.avgScore = subject.avgScore / subject.count
  })

  return {
    performance: {
      subjectStats: Object.values(subjectPerformance),
      dailyAverage: 8.5, // Mock data
      qualityScore: 4.6, // Mock data
      improvementAreas: ['Speed consistency', 'Detail orientation']
    }
  }
}

async function getAdminAnalytics(type: string, timeRange?: string) {
  switch (type) {
    case 'overview':
      return await getAdminOverview(timeRange)
    case 'platform':
      return await getPlatformAnalytics()
    default:
      throw new Error('Invalid analytics type')
  }
}

async function getAdminOverview(timeRange?: string) {
  const days = parseInt(timeRange?.replace('d', '') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalStudents, totalEvaluators, totalExams, totalEvaluations, revenue] = await Promise.all([
    db.student.count(),
    db.evaluator.count({ where: { isActive: true } }),
    db.exam.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    }),
    db.evaluation.count({
      where: {
        assignedAt: {
          gte: startDate
        }
      }
    }),
    db.evaluatorPayment.aggregate({
      where: {
        status: 'PROCESSED',
        processedAt: {
          gte: startDate
        }
      },
      _sum: {
        totalAmount: true
      }
    })
  ])

  return {
    overview: {
      totalStudents,
      totalEvaluators,
      activeExams: totalExams,
      totalEvaluations,
      monthlyRevenue: revenue._sum.totalAmount || 0,
      satisfactionRate: 92, // Mock data
      avgCompletionTime: 18 // Mock data
    }
  }
}

async function getPlatformAnalytics() {
  // Mock platform analytics data
  return {
    platform: {
      userGrowth: [
        { month: 'Jan', students: 100, evaluators: 10 },
        { month: 'Feb', students: 150, evaluators: 12 },
        { month: 'Mar', students: 200, evaluators: 15 },
        { month: 'Apr', students: 280, evaluators: 18 },
        { month: 'May', students: 350, evaluators: 22 },
        { month: 'Jun', students: 420, evaluators: 25 }
      ],
      revenue: [
        { month: 'Jan', amount: 50000 },
        { month: 'Feb', amount: 75000 },
        { month: 'Mar', amount: 90000 },
        { month: 'Apr', amount: 110000 },
        { month: 'May', amount: 135000 },
        { month: 'Jun', amount: 160000 }
      ],
      subjectDistribution: {
        ACCOUNTING: 25,
        LAW: 20,
        TAXATION: 18,
        COSTING: 15,
        AUDIT: 12,
        FINANCIAL_MANAGEMENT: 10
      },
      levelDistribution: {
        FOUNDATION: 40,
        INTERMEDIATE: 35,
        FINAL: 25
      }
    }
  }
}