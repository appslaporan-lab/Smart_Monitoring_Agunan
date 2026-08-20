const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

// For the ones mapping over reportRows uniquely (product, collateral, radius):
code = code.replace(/const productSummary = Array\.from\([\s\S]*?return \{[\s\S]*?total:/g, 
  "const productSummary = Array.from(new Map(reportRows.map((row) => [row.productBucket, 0])).keys()).map((label) => {\n    const entries = reportRows.filter((row) => row.productBucket === label);\n    return {\n      label,\n      total:");

code = code.replace(/const collateralSummary = Array\.from\([\s\S]*?return \{[\s\S]*?total:/g, 
  "const collateralSummary = Array.from(new Map(reportRows.map((row) => [row.collateralBucket, 0])).keys()).map((label) => {\n    const entries = reportRows.filter((row) => row.collateralBucket === label);\n    return {\n      label,\n      total:");

code = code.replace(/const radiusSummary = Array\.from\([\s\S]*?return \{[\s\S]*?total:/g, 
  "const radiusSummary = Array.from(new Map(reportRows.map((row) => [row.radiusBucket, 0])).keys()).map((label) => {\n    const entries = reportRows.filter((row) => row.radiusBucket === label);\n    return {\n      label,\n      total:");

// For the ones mapping over COLLECTING_REPORT_CONFIG (interest, tenor, arrears, plafond), restore label: range.label
code = code.replace(/const interestSummary = COLLECTING_REPORT_CONFIG\.interestRateRanges\.map\(\(range\) => \{[\s\S]*?return \{[\s\S]*?total:/g,
  "const interestSummary = COLLECTING_REPORT_CONFIG.interestRateRanges.map((range) => {\n    const entries = reportRows.filter((row) => row.interestRateBucket === range.label);\n    return {\n      label: range.label,\n      total:");

code = code.replace(/const tenorSummary = COLLECTING_REPORT_CONFIG\.tenorRanges\.map\(\(range\) => \{[\s\S]*?return \{[\s\S]*?total:/g,
  "const tenorSummary = COLLECTING_REPORT_CONFIG.tenorRanges.map((range) => {\n    const entries = reportRows.filter((row) => row.tenorBucket === range.label);\n    return {\n      label: range.label,\n      total:");

code = code.replace(/const arrearsSummary = COLLECTING_REPORT_CONFIG\.arrearsRanges\.map\(\(range\) => \{[\s\S]*?return \{[\s\S]*?total:/g,
  "const arrearsSummary = COLLECTING_REPORT_CONFIG.arrearsRanges.map((range) => {\n    const entries = reportRows.filter((row) => row.arrearsBucket === range.label);\n    return {\n      label: range.label,\n      total:");

code = code.replace(/const plafondSummary = COLLECTING_REPORT_CONFIG\.plafondRanges\.map\(\(range\) => \{[\s\S]*?return \{[\s\S]*?total:/g,
  "const plafondSummary = COLLECTING_REPORT_CONFIG.plafondRanges.map((range) => {\n    const entries = reportRows.filter((row) => row.plafondBucket === range.label);\n    return {\n      label: range.label,\n      total:");

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed');
