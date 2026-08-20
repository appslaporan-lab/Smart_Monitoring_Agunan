$content = Get-Content app/performa/kolektibilitas/page.tsx -Raw
$content = $content -replace 'label: range.label,', 'label,'
Set-Content app/performa/kolektibilitas/page.tsx $content
