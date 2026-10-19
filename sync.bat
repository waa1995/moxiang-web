@echo off
chcp 65001 >nul
echo ==========================================
echo 正在將《墨香 Web》同步至雲端...
echo ==========================================
git add .
set /p msg="請輸入本次更新描述 (直接按 Enter 略過): "
if "%msg%"=="" set msg=Update game at %date% %time%
git commit -m "%msg%"
git push origin main
echo.
echo ✅ 同步完成！
pause