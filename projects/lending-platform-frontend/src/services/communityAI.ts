export type BusinessType = 'Small Business' | 'Agriculture' | 'Education' | 'Healthcare' | 'Handicrafts';

interface LoanApplication {
    purpose: BusinessType;
    amount: number;
    businessDescription?: string;
}

interface CommunityData {
    guarantors: number;
    avgLocalIncome: number;
}

// AI Assessment Engine for Banking-Excluded Populations
export class FinancialInclusionAI {
    static assessLoan(applicationData: LoanApplication, communityData: CommunityData) {
      let viabilityScore = 0
      const assessmentFactors = []
      
      // Business Viability Assessment (40% weight)
      const businessViability = {
        'Small Business': { score: 35, demand: 'high', success: 'medium', description: 'Trading and retail have consistent demand' },
        'Agriculture': { score: 40, demand: 'essential', success: 'high', description: 'Food production is always needed' },
        'Education': { score: 30, demand: 'medium', success: 'medium', description: 'Education services have stable long-term demand' },
        'Healthcare': { score: 45, demand: 'critical', success: 'high', description: 'Healthcare is essential and recession-proof' },
        'Handicrafts': { score: 25, demand: 'medium', success: 'variable', description: 'Market dependent but culturally valuable' }
      }
      
      const businessData = businessViability[applicationData.purpose] || { score: 10, demand: 'unknown', success: 'low' }
      viabilityScore += businessData.score
      assessmentFactors.push(`Business type: ${applicationData.purpose} - ${businessData.description}`)
      
      // Community Support Assessment (35% weight) - Critical for unbanked populations
      const guarantorCount = communityData.guarantors || 2
      if (guarantorCount >= 3) {
        viabilityScore += 30
        assessmentFactors.push("Strong community network reduces default risk significantly")
      } else if (guarantorCount >= 2) {
        viabilityScore += 20
        assessmentFactors.push("Adequate community support provides social collateral")
      } else if (guarantorCount >= 1) {
        viabilityScore += 10
        assessmentFactors.push("Limited community support increases monitoring needs")
      } else {
        assessmentFactors.push("No community guarantors presents high default risk")
      }
      
      // Economic Sustainability Assessment (25% weight)
      const avgLocalIncome = communityData.avgLocalIncome || 300
      const loanToIncomeRatio = (applicationData.amount * 10) / avgLocalIncome // ALGO to USD conversion
      
      if (loanToIncomeRatio <= 0.5) {
        viabilityScore += 25
        assessmentFactors.push("Loan amount highly sustainable for local income levels")
      } else if (loanToIncomeRatio <= 1.0) {
        viabilityScore += 15
        assessmentFactors.push("Loan amount manageable with careful financial planning")
      } else if (loanToIncomeRatio <= 2.0) {
        viabilityScore += 8
        assessmentFactors.push("Loan amount stretches local income capacity")
      } else {
        viabilityScore += 2
        assessmentFactors.push("Loan amount may exceed realistic repayment capacity")
      }
      
      // Mobile Payment Activity Simulation (representing financial behavior)
      const hasRegularPayments = Math.random() > 0.25 // 75% have some mobile payment history
      if (hasRegularPayments) {
        viabilityScore += 15
        assessmentFactors.push("Regular mobile payment activity indicates financial discipline")
      } else {
        assessmentFactors.push("Limited payment history requires closer monitoring")
      }
      
      // Regional Economic Stability Factor
      const regionalStabilityScore = 5 + Math.floor(Math.random() * 10)
      viabilityScore += regionalStabilityScore
      assessmentFactors.push(`Regional economic conditions: ${regionalStabilityScore > 10 ? 'stable' : 'moderate'} environment`)
      
      // Business Plan Quality (if provided)
      if (applicationData.businessDescription && applicationData.businessDescription.length > 50) {
        viabilityScore += 10
        assessmentFactors.push("Detailed business plan demonstrates preparation and commitment")
      }
      
      // Calculate final assessment
      const approved = viabilityScore >= 60
      const riskLevel = viabilityScore >= 80 ? 'low' : viabilityScore >= 60 ? 'medium' : 'high'
      
      // Interest rates based on viability (higher viability = lower rates)
      let interestRate = 0
      if (approved) {
        interestRate = Math.max(8, 22 - (viabilityScore - 60) / 3)
      }
      
      // Maximum approved amount based on viability and local economy
      const baseMaxAmount = Math.min(applicationData.amount, avgLocalIncome / 2)
      const viabilityMultiplier = viabilityScore / 80
      const maxApprovedAmount = approved ? Math.floor(baseMaxAmount * viabilityMultiplier) : 0
      
      return {
        approved,
        viabilityScore,
        interestRate: Math.round(interestRate * 10) / 10,
        maxApprovedAmount,
        repaymentPeriod: 90,
        assessmentFactors,
        riskLevel,
        businessViability: businessData.success,
        communitySupport: guarantorCount >= 2 ? 'strong' : 'limited'
      }
    }
    
    // Generate realistic profile for demo purposes
    static generateDemoProfile() {
      return {
        phoneActivity: {
          accountAge: 120 + Math.random() * 500,
          regularTopups: Math.random() > 0.3,
          paymentFrequency: Math.floor(Math.random() * 20) + 5
        },
        socialFactors: {
          communityEndorsements: Math.floor(Math.random() * 4) + 1,
          businessExperience: Math.random() > 0.5,
          familySupport: Math.random() > 0.4
        },
        economicIndicators: {
          estimatedIncome: 200 + Math.random() * 400,
          assetOwnership: Math.random() > 0.6,
          businessAssets: Math.random() > 0.4
        }
      }
    }
    
    // Risk mitigation strategies for unbanked populations
    static getRiskMitigationStrategies(assessment: any) {
      const strategies = []
      
      if (assessment.riskLevel === 'high') {
        strategies.push("Reduce loan amount by 50%")
        strategies.push("Require additional community guarantors")
        strategies.push("Implement weekly check-ins")
      } else if (assessment.riskLevel === 'medium') {
        strategies.push("Monthly progress reviews")
        strategies.push("Community mentor assignment")
      } else {
        strategies.push("Standard quarterly reviews")
        strategies.push("Early repayment incentives available")
      }
      
      return strategies
    }
  }