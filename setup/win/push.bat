@echo off
REM UTF-8 cho cua so nay. KHONG CO DONG NAY thi chu tieng Viet cua server ra
REM thanh rac (vi du: "Redis connected" ra thanh cac ky tu la).
REM
REM cmd doc file .bat theo bang ma DANG dung, va no doc lai tung dong khi chay.
REM Doi bang ma o giua file roi de chu co dau phia duoi la mot cach lam hong
REM chinh file nay tren vai ban Windows - nen chu trong file nay co tinh de
REM KHONG DAU. Chu co dau la cua server, va no ra dung sau khi da chcp.
chcp 65001 >nul
REM ---------------------------------------------------------------------------
REM  Day ma len GitHub - co kiem truoc.
REM
REM    setup\win\push.bat "sua man dang nhap"
REM
REM  Khong day neu ma chua dich duoc hoac lint con keu. Day mot ban hong len
REM  nhanh chung la lam mat buoi sang cua nguoi keo ve sau.
REM ---------------------------------------------------------------------------
setlocal enabledelayedexpansion

set "ROOT=%~dp0..\.."
pushd "%ROOT%" || (echo Khong vao duoc thu muc goc & exit /b 1)

set "MESSAGE=%~1"
if "%MESSAGE%"=="" (
  echo [x] Thieu loi nhan. Vi du: setup\win\push.bat "sua man dang nhap"
  goto :fail
)

git rev-parse --is-inside-work-tree >nul 2>&1 || (echo [x] Cho nay khong phai kho git. & goto :fail)

REM --- Khong duoc de lot bi mat ---------------------------------------------
echo.
echo ^> Soi thu sap day
set "LEAK="
for /f "delims=" %%f in ('git status --porcelain --untracked-files^=all') do (
  set "LINE=%%f"
  echo !LINE! | findstr /r /c:"\.env$" /c:"\.env\." | findstr /v ".env.example" >nul && set "LEAK=!LINE!"
)
if defined LEAK (
  echo [x] Co file .env dang cho commit: !LEAK! - mo .gitignore ra xem lai.
  goto :fail
)

git status --short
for /f %%c in ('git status --porcelain --untracked-files^=all ^| find /c /v ""') do set "COUNT=%%c"
if "%COUNT%"=="0" (echo [x] Khong co gi de day. & goto :fail)

REM --- Kiem ------------------------------------------------------------------
echo.
echo ^> Kiem ma ^(dich + lint^)
call npm run build:shared --silent >nul || (echo [x] Goi dung chung khong dich duoc. & goto :fail)
call npm run check --silent            || (echo [x] Server chua qua duoc vong kiem. & goto :fail)
if exist "frontend\node_modules" (
  call npm run check:fe --silent || (echo [x] App chua qua duoc vong kiem. & goto :fail)
) else (
  echo   . bo qua app - chua cai thu vien
)
echo   [v] sach

REM --- Nhanh -----------------------------------------------------------------
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if "%BRANCH%"=="main" goto :confirm
if "%BRANCH%"=="master" goto :confirm
goto :push

:confirm
echo.
echo   ! Dang dung thang tren %BRANCH%.
set /p ANSWER="  Day thang len do? [y/N] "
if /i not "%ANSWER%"=="y" (
  echo [x] Dung. Tach nhanh: git switch -c ten-nhanh
  goto :fail
)

:push
echo.
echo ^> Day len %BRANCH%
git add -A                        || goto :fail
git commit -m "%MESSAGE%"         || goto :fail
git push -u origin "%BRANCH%"     || goto :fail
echo   [v] xong
popd
exit /b 0

:fail
popd
exit /b 1
