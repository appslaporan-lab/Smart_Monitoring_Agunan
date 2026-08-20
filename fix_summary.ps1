$content = Get-Content app/performa/kolektibilitas/page.tsx -Raw

# Replace productSummary
$content = $content -replace 'const productSummary = COLLECTING_REPORT_CONFIG\.creditProductCategories\.map\(\(range\) => \{\s*const entries = reportRows\.filter\(\(row\) => row\.productBucket === range\.label\);', 
'const productSummary = Array.from(new Map(reportRows.map((row) => [row.productBucket, 0])).keys()).map((label) => { const entries = reportRows.filter((row) => row.productBucket === label);'

# Replace collateralSummary
$content = $content -replace 'const collateralSummary = COLLECTING_REPORT_CONFIG\.collateralCategories\.map\(\(range\) => \{\s*const entries = reportRows\.filter\(\(row\) => row\.collateralBucket === range\.label\);', 
'const collateralSummary = Array.from(new Map(reportRows.map((row) => [row.collateralBucket, 0])).keys()).map((label) => { const entries = reportRows.filter((row) => row.collateralBucket === label);'

# Replace radiusSummary
$content = $content -replace 'const radiusSummary = COLLECTING_REPORT_CONFIG\.collateralCategories\.map\(\(range\) => \{\s*const entries = reportRows\.filter\(\(row\) => row\.collateralBucket === range\.label\);', 
'const radiusSummary = Array.from(new Map(reportRows.map((row) => [row.radiusBucket, 0])).keys()).map((label) => { const entries = reportRows.filter((row) => row.radiusBucket === label);'

# Let's fix the productBucket mapping too in reportRows to NOT use classifyByKeywords, but just row.produkKredit
$content = $content -replace 'productBucket: classifyByKeywords\(row\.produkKredit, COLLECTING_REPORT_CONFIG\.creditProductCategories\),', 'productBucket: row.produkKredit || "Tidak diketahui",'

# Fix collateralBucket mapping to NOT use classifyByKeywords, but just row.jenisJaminan
$content = $content -replace 'collateralBucket: classifyByKeywords\(row\.jenisJaminan, COLLECTING_REPORT_CONFIG\.collateralCategories\),', 'collateralBucket: row.jenisJaminan || "Tidak diketahui",'

Set-Content app/performa/kolektibilitas/page.tsx $content
