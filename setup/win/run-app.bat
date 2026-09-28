@echo off
chcp 65001 >nul
REM ---------------------------------------------------------------------------
REM  Chay RIENG app (frontend) - khong can Docker, khong can server.
REM
REM    setup\win\run-app.bat           chay binh thuong (dien thoai cung wifi)
REM    setup\win\run-app.bat tunnel    dien thoai khac mang / wifi chan LAN
REM
REM  Mo Expo Go tren dien thoai roi quet ma QR hien ra.
REM  Lan dau chay se tu cai goi (mat vai phut).
REM ---------------------------------------------------------------------------
setlocal

pushd "%~dp0..\..\frontend" || (echo [x] Khong thay thu muc frontend & goto :fail)

where node >nul 2>&1 || (echo [x] Chua co Node. Cai ban 22 hoac 24 tu nodejs.org & goto :fail)

if not exist "node_modules" (
  echo ^> Chua cai goi - dang cai...
  call npm install || goto :fail
  echo.
)

REM Expo Go tren dien thoai dang dang nhap thi CLI tren may cung phai dang nhap
REM CUNG tai khoan, khong thi dien thoai bao "not signed in to Expo CLI".
call npx expo whoami >nul 2>&1
if errorlevel 1 (
  echo ^> Chua dang nhap Expo tren may nay. Dang nhap CUNG tai khoan voi Expo Go:
  call npx expo login || goto :fail
  echo.
)

echo ^> App Nook - quet ma QR bang Expo Go
echo   (Ctrl+C de dung)
echo.

REM --clear: xoa bo nho dem cua Metro, de phong chu va giao dien moi hien dung.
if /i "%~1"=="tunnel" (
  call npx expo start --clear --tunnel
) else (
  call npx expo start --clear
)

popd
exit /b 0

:fail
popd
echo.
pause
exit /b 1
