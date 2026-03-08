/**
 * Stubs for all data — in practice, these would be calculated from input or sourced from DB
 * This is a static demo for the explicit prompt portrait/structure, refactor to pull from real input as needed.
 */


const DEMO_DATA = {
  // Page 1–2: Personal profile
  clientName: "John A. Employee",
  employer: "Sample Corporation Inc.",
  date: "February 2026",
  preparedBy: "WINTRICE Retirement Intelligence System",
  maritalStatus: "Married",
  dependents: 2,
  currentAge: 35,
  retirementAge: 67,
  lifeExpectancy: 92,
  annualSalary: 95000,
  salaryGrowth: 0.03,
  retirementSavings: 82500,
  monthlyContribution: 750,
  employerMatch: 0.04,

  // Page 3: Health Scorecard
  wintriceScore: 72,
  savingsRateScore: 75,
  debtRatioScore: 68,
  investmentAllocScore: 70,
  emergencyFundScore: 60,
  retirementReadinessScore: 72,

  // Page 4: Net Worth
  netWorth: 151000,
  assets: [
    { label: '401(k)', value: 82500 },
    { label: 'Checking/Savings', value: 18000 },
    { label: 'Brokerage', value: 12000 },
    { label: 'Home Value', value: 350000 }
  ],
  liabilities: [
    { label: 'Mortgage', value: 285000 },
    { label: 'Student Loans', value: 22000 },
    { label: 'Credit Cards', value: 4500 }
  ],

  // Page 5: Cash Flow
  monthlyIncome: 7916,
  monthlyExpenses: 6200,
  monthlySurplus: 1716,

  // Page 6: Emergency Fund
  monthlyCoreExpenses: 5500,
  recommendedEFund: 33000,
  liquidSavings: 18000,
  efundStatus: 55,

  // Page 7: Debt Analysis
  dtiRatio: 32,
  loanPayoffYears: 4,
  mortgageYears: 25,

  // Page 8: Investment Allocation
  allocation: [
    { label: "U.S. Stocks", percent: 60 },
    { label: "International Stocks", percent: 15 },
    { label: "Bonds", percent: 20 },
    { label: "Cash", percent: 5 }
  ],
  riskProfile: "Moderate Growth",

  // Page 9: Risk Tolerance
  riskCapacity: "Moderate",
  riskBehavior: "Slightly Conservative",
  portfolioAlignment: 85,

  // Page 10: Retirement Projection
  projectedPortfolio67: 1420000,
  estimatedAnnualRetIncome: 78000,
  retirementProjStartAge: 35,
  retirementProjEndAge: 67,

  // Page 11: Retirement Income Gap
  targetRetirementIncome: 95000,
  retirementIncomeGap: 17000,
  gapCoverage: 18,

  // Page 12: Required Savings Adjustment
  savingsIncrease: 325,
  delayRetirementYears: 2,

  // Page 13: Social Security Estimate
  ssa67: 28000,
  ssa70: 35200,
  breakEvenAge: 81,

  // Page 14: Plan Optimization
  currentContribution: 0.08,
  recommendedContribution: 0.12,
  employerMatchStatus: "Maximized",

  // Page 15: Tax Optimization
  taxRate: 22,
  traditionalPercent: 60,
  rothPercent: 40,
  lifetimeTaxSavings: 112000,

  // Page 16: Inflation
  inflationRate: 0.028,
  salaryToday: 95000,
  salaryFuture: 190000, // = $95,000 at retirement after inflation

  // Page 17: Longevity
  chancePast90: 38,
  chancePast95: 16,
  portfolioLastsTo: 93,

  // Page 18: Healthcare
  healthcareAnnual: 18500,
  healthcareLifetime: 310000,

  // Page 19: Insurance
  lifeInsurance: 500000,
  recommendedInsurance: 850000,
  disabilityCoverage: '60% Income Replacement',
  insuranceGap: 350000,

  // Page 20: College Planning
  children: 2,
  collegeCost: 240000,
  savings529: 15000,
  collegeGap: 180000,

  // Page 21: Market Scenarios
  optimisticPortfolio: 1780000,
  optimisticReplacement: 94,
  conservativePortfolio: 1050000,
  conservativeReplacement: 69,

  // Page 22–24: Action plan & implementation
  actionPlan: [
    "Increase retirement contribution to 12%",
    "Build emergency fund to $33,000",
    "Increase life insurance by $350,000",
    "Rebalance portfolio annually"
  ],
  roadmap: [
    { quarter: "Quarter 1", steps: ["Increase contribution 2%", "Rebalance portfolio"] },
    { quarter: "Quarter 2", steps: ["Open Roth IRA"] },
    { quarter: "Quarter 3", steps: ["Adjust insurance"] },
    { quarter: "Quarter 4", steps: ["Review tax positioning"] }
  ],

  // Page 25: Disclosures
  assumedReturn: 6.5,
  retireAge: 67,
  lifeExp: 92,
};