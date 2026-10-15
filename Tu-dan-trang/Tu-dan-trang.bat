@echo off
chcp 65001 >nul
rem Kéo thả file (.pptx .docx .md .txt) lên biểu tượng này, hoặc nhấp đúp để mở cửa sổ.
cd /d "%~dp0"
if "%~1"=="" (
  python tu_dan_trang.py --gui
) else (
  python tu_dan_trang.py --gui "%~1"
)
if errorlevel 1 pause
