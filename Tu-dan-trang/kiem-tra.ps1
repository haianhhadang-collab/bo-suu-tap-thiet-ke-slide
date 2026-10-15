# Mở file .pptx bằng PowerPoint (ẩn), xuất ảnh từng trang và đếm animation để kiểm tra.
# Cách dùng: powershell -ExecutionPolicy Bypass -File kiem-tra.ps1 "duong\dan\file.pptx" "thu\muc\anh"
param([string]$File, [string]$OutDir)
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force $OutDir | Out-Null
$app = New-Object -ComObject PowerPoint.Application
try {
    $pres = $app.Presentations.Open($File, -1, 0, 0)   # ReadOnly, Untitled=false, WithWindow=false
    $i = 0
    foreach ($s in $pres.Slides) {
        $i++
        $png = Join-Path $OutDir ("trang{0:D2}.png" -f $i)
        $s.Export($png, "PNG", 1600, 900)
        $n = $s.TimeLine.MainSequence.Count
        $tr = $s.SlideShowTransition.EntryEffect
        "trang {0}: animation={1} chuyen_trang={2}" -f $i, $n, $tr
    }
    $pres.Close()
    "OK: {0} trang" -f $i
} finally {
    $app.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($app) | Out-Null
}
