try {
    $wps = New-Object -ComObject "KWPS.Application"
    $wps.Visible = $false
    $doc = $wps.Documents.Open("C:\dev\app\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx")
    $pages = $doc.ComputeStatistics(2)
    $words = $doc.ComputeStatistics(0)
    $doc.Close([ref]$false)
    $wps.Quit()
    Write-Host "WPS_PAGES: $pages"
    Write-Host "WPS_WORDS: $words"
} catch {
    Write-Host "WPS_ERROR: $($_.Exception.Message)"
}
