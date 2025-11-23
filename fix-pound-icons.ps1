# PowerShell script to fix Pound icon imports
# Run this from your ConveyPro directory

$files = @(
    "components\portal\portal-matter-view-client.tsx",
    "components\portal\portal-offer-acceptance.tsx",
    "components\purchase-reports\purchase-reports-client.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..."
        $content = Get-Content $file -Raw

        # Replace Pound with PoundSterling in imports
        $content = $content -replace 'Pound,', 'PoundSterling,'
        $content = $content -replace ', Pound ', ', PoundSterling '

        # Replace <Pound with <PoundSterling in JSX
        $content = $content -replace '<Pound ', '<PoundSterling '

        Set-Content $file $content -NoNewline
        Write-Host "✓ Fixed $file"
    } else {
        Write-Host "⚠ File not found: $file"
    }
}

Write-Host "`nDone! All Pound icons have been replaced with PoundSterling."
