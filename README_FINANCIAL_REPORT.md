# Financial Report Controller Documentation

## Overview

The Financial Report Controller handles automatic generation of 25-page financial planning reports based on employee questionnaire inputs. It implements public SSA formulas and standard retirement calculation formulas.

## Features

✅ **Retirement Account Growth Calculations**
- Year-by-year projections
- Employee and employer contributions
- Salary growth over time
- Investment returns
- Inflation adjustments

✅ **Social Security Estimation**
- Average Indexed Monthly Earnings (AIME)
- Primary Insurance Amount (PIA) using SSA bend points
- Early/delayed retirement adjustments

✅ **Retirement Income Analysis**
- Safe withdrawal rate calculations
- Combined income (savings + Social Security)
- Replacement ratio analysis
- Income gap/surplus calculations

## Installation

The controller is already included in the project. No additional dependencies are required beyond the existing Express and Mongoose setup.

## Usage

### Basic Example

```javascript
const { generateFinancialReport } = require('./controllers/financialReport');

const employeeInputs = {
  currentAge: 25,
  retirementAge: 65,
  currentSalary: 50000,
  salaryGrowthRate: 0.03,
  employeeContributionRate: 0.10,
  employerContributionRate: 0.05,
  expectedReturn: 0.07,
  inflationRate: 0.025
};

const result = generateFinancialReport(employeeInputs);

if (result.success) {
  console.log('Final Retirement Balance:', result.data.summary.finalRetirementBalance);
  console.log('Monthly Social Security:', result.data.socialSecurity.monthlyBenefit);
  console.log('Total Monthly Income:', result.data.combinedIncome.totalMonthlyIncome);
}
```

### Express Route Handler

```javascript
// In your routes file
const { generateReport } = require('../controllers/financialReport');
router.post('/generate', generateReport);

// Example POST request body:
{
  "currentAge": 40,
  "retirementAge": 67,
  "currentSalary": 75000,
  "currentRetirementBalance": 150000,
  "employeeContributionRate": 0.12,
  "employerContributionRate": 0.06,
  "expectedReturn": 0.06,
  "inflationRate": 0.03
}
```

## Input Parameters

### Required Fields

- `currentAge` (number): Employee's current age
- `retirementAge` (number): Planned retirement age
- `currentSalary` (number): Current annual salary

### Optional Fields (with defaults)

- `salaryGrowthRate` (number, default: 0.03): Annual salary growth rate (3%)
- `currentRetirementBalance` (number, default: 0): Current retirement savings balance
- `employeeContributionRate` (number, default: 0.10): Employee contribution rate (10%)
- `employerContributionRate` (number, default: 0.05): Employer contribution rate (5%)
- `expectedReturn` (number, default: 0.07): Expected annual investment return (7%)
- `inflationRate` (number, default: 0.025): Annual inflation rate (2.5%)
- `withdrawalRate` (number, default: 0.04): Retirement withdrawal rate (4%)
- `yearsWorked` (number): Years worked (estimated if not provided)

## Output Structure

The `generateFinancialReport` function returns:

```javascript
{
  success: true,
  data: {
    inputs: { /* all input parameters */ },
    retirementProjection: [ /* year-by-year data */ ],
    summary: {
      finalRetirementBalance: number,
      inflationAdjustedBalance: number,
      finalSalary: number,
      totalContributions: number,
      totalInvestmentGrowth: number,
      returnOnContributions: number
    },
    socialSecurity: {
      averageIndexedMonthlyEarnings: number,
      primaryInsuranceAmount: number,
      adjustedPrimaryInsuranceAmount: number,
      monthlyBenefit: number,
      annualBenefit: number,
      fullRetirementAge: number,
      retirementAgeAdjustment: number
    },
    retirementIncome: {
      annualIncome: number,
      monthlyIncome: number,
      withdrawalRate: number
    },
    combinedIncome: {
      totalAnnualIncome: number,
      totalMonthlyIncome: number,
      replacementRatio: number,
      finalSalary: number,
      incomeGap: number,
      hasSurplus: boolean,
      portfolioIncomePercentage: number,
      socialSecurityIncomePercentage: number
    },
    calculatedAt: string, // ISO timestamp
    version: string
  }
}
```

## Testing

Run the test suite with simulated user inputs:

```bash
node controllers/financialReport.test.js
```

The test file includes 5 test cases:
1. Young Professional (25 → 65)
2. Mid-Career Professional (40 → 67)
3. Near Retirement (55 → 65)
4. Early Retirement (30 → 55)
5. Delayed Retirement (50 → 70)

## Formulas Used

### Retirement Account Growth

For each year until retirement:
```
Balance_t = (Balance_(t-1) + Contribution_t) × (1 + Expected_Return)
Real_Balance = Balance / (1 + Inflation_Rate)^Years
```

### Social Security (Simplified)

```
AIME = Average Annual Earnings / 12
PIA = (90% × first bend) + (32% × second bend) + (15% × remaining)
Adjusted PIA = PIA × (1 ± adjustment_rate × years_difference)
```

### Retirement Income

```
Annual_Income = Real_Balance × Withdrawal_Rate
Monthly_Income = Annual_Income / 12
```

## Notes

- **SSA Bend Points**: Currently using 2024 values (bendPoint1: $1,115, bendPoint2: $6,721). These should be updated annually or made configurable.
- **Early Retirement**: Reduces benefits by ~6.67% per year early
- **Delayed Retirement**: Increases benefits by ~8% per year delayed
- **Full Retirement Age**: Defaults to 67, but varies by birth year
- **Inflation Adjustment**: All future balances are adjusted to today's dollars for credibility

## Next Steps for Report Generation

The controller provides all calculation results. To generate the 25-page PDF report:

1. Use the calculation results from `generateFinancialReport()`
2. Feed data into a PDF generation library (e.g., PDFKit, Puppeteer, ReportLab)
3. Populate predefined template sections with calculated values
4. Generate charts/tables from `retirementProjection` array
5. Compile all 25 pages into a single PDF

## Error Handling

The controller validates inputs and returns error messages:

```javascript
{
  success: false,
  error: "Missing required field: currentAge"
}
```

Common errors:
- Missing required fields
- Invalid age ranges (retirement age ≤ current age)
- Invalid numeric values

## License

All formulas used are public domain:
- Social Security formulas from SSA (publicly available)
- Standard retirement calculation formulas (public domain)
- No licensing required for formulas themselves
