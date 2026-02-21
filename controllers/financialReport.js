/**
 * Financial Report Controller
 * Handles automatic generation of 25-page financial planning reports,
 * with PDF export using PDFKit
 */

import PDFDocument from "pdfkit";
import { Readable } from "stream";

/**
 * Calculate retirement account growth year-by-year
 * @param {Object} inputs - Employee inputs from questionnaire
 * @returns {Array} Year-by-year projection data
 */
function calculateRetirementGrowth(inputs) {
  const {
    currentAge,
    retirementAge,
    currentSalary,
    salaryGrowthRate = 0.03,
    currentRetirementBalance = 0,
    employeeContributionRate = 0.10,
    employerContributionRate = 0.05,
    expectedReturn = 0.07,
    inflationRate = 0.025
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const projection = [];
  let balance = currentRetirementBalance;
  let salary = currentSalary;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const age = currentAge + year;
    const employeeContribution = salary * employeeContributionRate;
    const employerContribution = salary * employerContributionRate;
    const totalContribution = employeeContribution + employerContribution;
    const investmentGrowth = balance * expectedReturn;
    balance = balance + totalContribution + investmentGrowth;
    const inflationAdjustedBalance = balance / Math.pow(1 + inflationRate, year);

    projection.push({
      year,
      age,
      salary: parseFloat(salary.toFixed(2)),
      employeeContribution: parseFloat(employeeContribution.toFixed(2)),
      employerContribution: parseFloat(employerContribution.toFixed(2)),
      totalContribution: parseFloat(totalContribution.toFixed(2)),
      investmentGrowth: parseFloat(investmentGrowth.toFixed(2)),
      yearEndBalance: parseFloat(balance.toFixed(2)),
      inflationAdjustedBalance: parseFloat(inflationAdjustedBalance.toFixed(2))
    });
    salary = salary * (1 + salaryGrowthRate);
  }

  return projection;
}

/**
 * Calculate Social Security benefits using public SSA formulas
 * @param {Object} inputs - Employee inputs
 * @returns {Object} Social Security benefit estimates
 */
function calculateSocialSecurity(inputs) {
  const {
    currentAge,
    retirementAge,
    currentSalary,
    yearsWorked = null,
    fullRetirementAge = 67
  } = inputs;

  const estimatedYearsWorked = yearsWorked || Math.max(1, currentAge - 22);
  const averageAnnualEarnings = currentSalary * Math.min(estimatedYearsWorked / 35, 1);
  const averageMonthlyEarnings = averageAnnualEarnings / 12;
  const bendPoint1 = 1115;
  const bendPoint2 = 6721;
  let pia = 0;
  if (averageMonthlyEarnings <= bendPoint1) {
    pia = 0.90 * averageMonthlyEarnings;
  } else if (averageMonthlyEarnings <= bendPoint2) {
    pia = (0.90 * bendPoint1) + (0.32 * (averageMonthlyEarnings - bendPoint1));
  } else {
    pia = (0.90 * bendPoint1) +
      (0.32 * (bendPoint2 - bendPoint1)) +
      (0.15 * (averageMonthlyEarnings - bendPoint2));
  }
  let adjustedPIA = pia;
  const yearsDifference = retirementAge - fullRetirementAge;
  if (yearsDifference < 0) {
    const reductionRate = 0.0667;
    const reduction = Math.abs(yearsDifference) * reductionRate;
    adjustedPIA = pia * (1 - reduction);
  } else if (yearsDifference > 0) {
    const increaseRate = 0.08;
    adjustedPIA = pia * (1 + (yearsDifference * increaseRate));
  }
  adjustedPIA = Math.max(0, adjustedPIA);

  return {
    averageIndexedMonthlyEarnings: parseFloat(averageMonthlyEarnings.toFixed(2)),
    primaryInsuranceAmount: parseFloat(pia.toFixed(2)),
    adjustedPrimaryInsuranceAmount: parseFloat(adjustedPIA.toFixed(2)),
    monthlyBenefit: parseFloat(adjustedPIA.toFixed(2)),
    annualBenefit: parseFloat((adjustedPIA * 12).toFixed(2)),
    fullRetirementAge,
    retirementAgeAdjustment: yearsDifference,
    yearsWorked: estimatedYearsWorked
  };
}

/**
 * Calculate retirement income from savings
 * @param {number} retirementBalance - Total balance at retirement
 * @param {number} withdrawalRate - Annual withdrawal rate (default 4%)
 * @returns {Object} Retirement income estimates
 */
function calculateRetirementIncome(retirementBalance, withdrawalRate = 0.04) {
  const annualIncome = retirementBalance * withdrawalRate;
  const monthlyIncome = annualIncome / 12;
  return {
    annualIncome: parseFloat(annualIncome.toFixed(2)),
    monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
    withdrawalRate: withdrawalRate
  };
}

/**
 * Calculate combined retirement income and replacement ratio
 * @param {Object} retirementIncome - Income from savings
 * @param {Object} socialSecurity - Social Security benefits
 * @param {number} finalSalary - Final salary at retirement
 * @returns {Object} Combined income analysis
 */
function calculateCombinedIncome(retirementIncome, socialSecurity, finalSalary) {
  const totalAnnualIncome = retirementIncome.annualIncome + socialSecurity.annualBenefit;
  const totalMonthlyIncome = retirementIncome.monthlyIncome + socialSecurity.monthlyBenefit;
  const replacementRatio = finalSalary > 0
    ? (totalAnnualIncome / finalSalary) * 100
    : 0;
  const incomeGap = finalSalary - totalAnnualIncome;
  const hasSurplus = incomeGap < 0;

  return {
    totalAnnualIncome: parseFloat(totalAnnualIncome.toFixed(2)),
    totalMonthlyIncome: parseFloat(totalMonthlyIncome.toFixed(2)),
    replacementRatio: parseFloat(replacementRatio.toFixed(2)),
    finalSalary: parseFloat(finalSalary.toFixed(2)),
    incomeGap: parseFloat(incomeGap.toFixed(2)),
    hasSurplus,
    portfolioIncomePercentage: (retirementIncome.annualIncome / totalAnnualIncome) * 100,
    socialSecurityIncomePercentage: (socialSecurity.annualBenefit / totalAnnualIncome) * 100
  };
}

/**
 * Main function to generate complete financial report calculations
 * @param {Object} employeeInputs - All inputs from employee questionnaire
 * @returns {Object} Complete calculation results for report generation
 */
function generateFinancialReport(employeeInputs) {
  try {
    const requiredFields = ['currentAge', 'retirementAge', 'currentSalary'];
    for (const field of requiredFields) {
      if (employeeInputs[field] === undefined || employeeInputs[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (employeeInputs.currentAge >= employeeInputs.retirementAge) {
      throw new Error('Retirement age must be greater than current age');
    }

    const retirementProjection = calculateRetirementGrowth(employeeInputs);
    const finalRetirementBalance = retirementProjection[retirementProjection.length - 1].yearEndBalance;
    const inflationAdjustedBalance = retirementProjection[retirementProjection.length - 1].inflationAdjustedBalance;
    const finalSalary = retirementProjection[retirementProjection.length - 1].salary;
    const socialSecurity = calculateSocialSecurity(employeeInputs);
    const withdrawalRate = employeeInputs.withdrawalRate || 0.04;
    const retirementIncome = calculateRetirementIncome(inflationAdjustedBalance, withdrawalRate);
    const combinedIncome = calculateCombinedIncome(
      retirementIncome,
      socialSecurity,
      finalSalary
    );

    const totalContributions = retirementProjection.reduce(
      (sum, year) => sum + year.totalContribution, 0
    );
    const totalInvestmentGrowth = finalRetirementBalance -
      (employeeInputs.currentRetirementBalance || 0) - totalContributions;

    const reportData = {
      inputs: {
        currentAge: employeeInputs.currentAge,
        retirementAge: employeeInputs.retirementAge,
        yearsToRetirement: employeeInputs.retirementAge - employeeInputs.currentAge,
        currentSalary: employeeInputs.currentSalary,
        salaryGrowthRate: employeeInputs.salaryGrowthRate || 0.03,
        currentRetirementBalance: employeeInputs.currentRetirementBalance || 0,
        employeeContributionRate: employeeInputs.employeeContributionRate || 0.10,
        employerContributionRate: employeeInputs.employerContributionRate || 0.05,
        expectedReturn: employeeInputs.expectedReturn || 0.07,
        inflationRate: employeeInputs.inflationRate || 0.025,
        withdrawalRate: withdrawalRate
      },
      retirementProjection,
      summary: {
        finalRetirementBalance: parseFloat(finalRetirementBalance.toFixed(2)),
        inflationAdjustedBalance: parseFloat(inflationAdjustedBalance.toFixed(2)),
        finalSalary: parseFloat(finalSalary.toFixed(2)),
        totalContributions: parseFloat(totalContributions.toFixed(2)),
        totalInvestmentGrowth: parseFloat(totalInvestmentGrowth.toFixed(2)),
        returnOnContributions: totalContributions > 0
          ? parseFloat(((totalInvestmentGrowth / totalContributions) * 100).toFixed(2))
          : 0
      },
      socialSecurity,
      retirementIncome,
      combinedIncome,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return {
      success: true,
      data: reportData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Generate a 25-page PDF financial report from calculation results.
 * @param {Object} reportData - Result object from generateFinancialReport
 * @returns {PDFDocument} - The PDFKit document
 */
function generateFinancialReportPDF(reportData) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  const FONT_FAMILY = 'Times-Roman'; // PDFKit built-in serif font
  const FONT_SIZE = 12;
  const HEADER_TEXT = "AIFT Financial Report";
  const TOTAL_PAGES = 25;

  // --- Track the PDF stream in a Readable for Express ---
  const stream = new Readable();
  stream._read = () => {};
  doc.on('data', chunk => stream.push(chunk));
  doc.on('end', () => stream.push(null));

  // Header/footer function
  function drawHeaderFooter(currentPage) {
    doc.font(FONT_FAMILY).fontSize(10);
    // Header
    doc.text(HEADER_TEXT, 0, 35, { align: "center", width: doc.page.width - 100 });
    // Footer
    doc.text(`Page ${currentPage} of ${TOTAL_PAGES}`, 0, doc.page.height - 50, {
      align: "center", width: doc.page.width - 100
    });
    doc.moveDown(1);
    doc.fontSize(FONT_SIZE);
  }

  // Helper
  function writeKeyValue(key, value) {
    doc.text(`${key}: `, { continued: true, underline: false, font: FONT_FAMILY });
    doc.font(FONT_FAMILY).fontSize(FONT_SIZE).text(`${value}`);
  }

  // Split projection pages for year-by-year
  function getRetirementProjectionSection(startIdx, endIdx) {
    // These are summaries, not all data fields to fit page.
    return reportData.retirementProjection
      .slice(startIdx, endIdx)
      .map(year => `Year ${year.year} (Age ${year.age}) - Salary: $${year.salary}  |  Balance: $${year.yearEndBalance}`).join('\n');
  }

  // --- Generate Pages ---
  let currentPage = 1;

  for (; currentPage <= TOTAL_PAGES; currentPage++) {
    if (currentPage !== 1) doc.addPage();

    drawHeaderFooter(currentPage);

    doc.font(FONT_FAMILY).fontSize(FONT_SIZE);

    if (currentPage === 1) {
      doc.text('Executive Summary', { align: 'left' });
      doc.moveDown();
      writeKeyValue('Report Created', reportData.calculatedAt);
      writeKeyValue('Version', reportData.version);
      writeKeyValue('Years to Retirement', reportData.inputs.yearsToRetirement);
      writeKeyValue('Final Projected Salary', `$${reportData.summary.finalSalary}`);
      writeKeyValue('Inflation-Adjusted Retirement Balance', `$${reportData.summary.inflationAdjustedBalance}`);
      writeKeyValue('Combined Income Replacement Ratio', `${reportData.combinedIncome.replacementRatio}%`);
      doc.moveDown();
      doc.text('See the detailed breakdown in the subsequent pages.');
    }
    else if (currentPage === 2) {
      doc.text('Input Summary', { underline: true });
      doc.moveDown();
      Object.entries(reportData.inputs).forEach(([k, v]) =>
        writeKeyValue(k, typeof v === 'number' ? v.toFixed(3) : v)
      );
    }
    else if (currentPage === 3) {
      doc.text('Summary Statistics', { underline: true });
      doc.moveDown();
      Object.entries(reportData.summary).forEach(([k, v]) =>
        writeKeyValue(k, v)
      );
    }
    else if (currentPage === 4) {
      doc.text('Social Security Details', { underline: true });
      doc.moveDown();
      Object.entries(reportData.socialSecurity).forEach(([k, v]) =>
        writeKeyValue(k, v)
      );
    }
    else if (currentPage === 5) {
      doc.text('Retirement Income', { underline: true });
      doc.moveDown();
      Object.entries(reportData.retirementIncome).forEach(([k, v]) =>
        writeKeyValue(k, v)
      );
    }
    else if (currentPage === 6) {
      doc.text('Combined Income Analysis', { underline: true });
      doc.moveDown();
      Object.entries(reportData.combinedIncome).forEach(([k, v]) =>
        writeKeyValue(k, v)
      );
    }
    else if (currentPage === 7) {
      doc.text('Retirement Projection - First Decade', { underline: true });
      doc.moveDown();
      doc.text(getRetirementProjectionSection(0, 10));
    }
    else if (currentPage === 8) {
      doc.text('Retirement Projection - Second Decade', { underline: true });
      doc.moveDown();
      doc.text(getRetirementProjectionSection(10, 20));
    }
    else if (currentPage === 9) {
      doc.text('Retirement Projection - Third Decade', { underline: true });
      doc.moveDown();
      doc.text(getRetirementProjectionSection(20, 30));
    }
    else if (currentPage === 10) {
      doc.text('Retirement Projection - Detailed Table', { underline: true });
      doc.moveDown();
      // Table header
      doc.text('Year | Age | Salary | EmpC | EmplyrC | TotalC | Growth | YrEndBal | InflAdjBal', { font: FONT_FAMILY });
      doc.moveDown(0.5);
      // Table data -- limit to fit page
      const maxRows = 25;
      let i = 0;
      for (const year of reportData.retirementProjection.slice(0, maxRows)) {
        doc.text(
          `${year.year} | ${year.age} | $${year.salary} | $${year.employeeContribution} | $${year.employerContribution} | $${year.totalContribution} | $${year.investmentGrowth} | $${year.yearEndBalance} | $${year.inflationAdjustedBalance}`,
          { font: FONT_FAMILY, fontSize: 10 }
        );
        if (++i >= maxRows) break;
      }
    }
    else {
      // Filler/Placeholder for 25 page length
      doc.text(`Appendix & Notes - Page ${currentPage}`, { underline: true });
      doc.moveDown();
      doc.text(
        "This page is intentionally left for report details, explanations, graphs, participant notes, or visualizations.\n\n" +
        "In a full implementation, quantitative charts, educational content, FAQs, glossary, or regulatory disclaimers would be inserted in these pages."
      );
    }
  }

  doc.end(); // Finalize PDF
  return stream;
}

/**
 * Controller function for Express route handler
 * Generates financial calculations and streams a PDF with specified formatting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateReport(req, res) {
  try {
    const employeeInputs = req.body;
    const result = generateFinancialReport(employeeInputs);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Generate/stream PDF using PDFKit
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=AIFT_Financial_Report.pdf');

    const pdfStream = generateFinancialReportPDF(result.data);
    pdfStream.pipe(res);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating financial report',
      details: error.message
    });
  }
}

/**
 * Get report by ID (for retrieving stored reports)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getReport(req, res) {
  try {
    const { reportId } = req.params;
    res.status(200).json({
      success: true,
      message: 'Report retrieval endpoint - implement database lookup',
      reportId
    });
  } catch (error) {
    console.error('Error retrieving report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving report'
    });
  }
}

export {
  generateReport,
  getReport,
  generateFinancialReport,
  calculateRetirementGrowth,
  calculateSocialSecurity,
  calculateRetirementIncome,
  calculateCombinedIncome,
  generateFinancialReportPDF
};