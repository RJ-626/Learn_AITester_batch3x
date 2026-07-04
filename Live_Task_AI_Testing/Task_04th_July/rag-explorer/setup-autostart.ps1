# Setup RAG Explorer to start automatically on Windows login (runs silently in background)
$startupFolder = [Environment]::GetFolderPath("Startup")
$sourceVbs = "C:\Users\DELL\OneDrive\Documents\AITesterBlueprint3x\Live_Task_AI_Testing\Task_04th_July\rag-explorer\start-silent.vbs"
$destVbs = Join-Path $startupFolder "RAG-Explorer-Start.vbs"

if (-not (Test-Path $sourceVbs)) {
    Write-Error "Could not find start-silent.vbs. Make sure you are in the rag-explorer directory."
    exit 1
}

Copy-Item -Path $sourceVbs -Destination $destVbs -Force
Write-Host "✅ RAG Explorer added to Windows Startup!" -ForegroundColor Green
Write-Host "   It will start automatically every time you log in." -ForegroundColor Cyan
Write-Host "   Shortcut location: $destVbs" -ForegroundColor DarkGray
Write-Host ""
Write-Host "To remove autostart, delete the shortcut above or run:" -ForegroundColor Yellow
Write-Host "   Remove-Item '$destVbs' -Force" -ForegroundColor White
Write-Host ""
Write-Host "To start manually right now, run:" -ForegroundColor Yellow
Write-Host "   .\\start-silent.vbs" -ForegroundColor White
