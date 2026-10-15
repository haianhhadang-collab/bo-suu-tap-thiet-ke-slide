@echo off
chcp 65001 >nul
rem Chạy nền: mọi file thả vào thư mục Hop-thu-vao sẽ tự được dàn trang, kết quả nằm trong Ket-qua.
cd /d "%~dp0"
title Tu dan trang - dang theo doi Hop-thu-vao
python tu_dan_trang.py --theo-doi
pause
