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
REM  Chay Nook.
REM
REM    setup\win\run.bat          bat ca server lan app
REM    setup\win\run.bat be       chi server
REM    setup\win\run.bat fe       chi app
REM
REM  May chua cai thi no tu goi install.bat - nen van dung duoc tu may trang.
REM ---------------------------------------------------------------------------
setlocal enabledelayedexpansion

set "ROOT=%~dp0..\.."
pushd "%ROOT%" || (echo Khong vao duoc thu muc goc & exit /b 1)
set "COMPOSE=backend\docker\compose.dev.yml"
set "WHAT=%~1"
if "%WHAT%"=="" set "WHAT=all"

where node >nul 2>&1 || (echo [x] Chua co Node. Cai ban 22 hoac 24. & goto :fail)

REM --- Chua cai thi cai truoc ------------------------------------------------
set "READY=1"
if not exist "node_modules" set "READY="
if not exist "backend\.env" set "READY="
if not defined READY (
  echo ^> Chua cai - chay install truoc
  call "%~dp0install.bat" %WHAT% || goto :fail
  echo.
)

REM --- Thu server dua vao ----------------------------------------------------
if not "%WHAT%"=="fe" (
  docker info >nul 2>&1 || (echo [x] Docker chua bat. Mo Docker Desktop roi chay lai. & goto :fail)
  docker compose -f "%COMPOSE%" up -d >nul || goto :fail
  set "DBPORT="
  for /f "tokens=1,* delims==" %%a in ('type "backend\.env" ^| findstr /b "DB_PORT="') do set "DBPORT=%%b"
  if "!DBPORT!"=="5433" docker compose -f "%COMPOSE%" --profile db up -d >nul
  echo   [v] Redis 6380 . Postgres cong !DBPORT!
)

REM --- Chay ------------------------------------------------------------------
echo.
if "%WHAT%"=="be" (
  echo ^> Server - http://localhost:4000/docs
  call npm run dev:be
  goto :done
)
if "%WHAT%"=="fe" (
  echo ^> App - quet ma QR bang Expo Go
  call npm run dev:fe
  goto :done
)
if "%WHAT%"=="all" (
  echo ^> Server - mo o cua so rieng, http://localhost:4000/docs
  start "Nook server" cmd /k "chcp 65001 >nul && cd /d %ROOT% && npm run dev:be"
  ping -n 3 127.0.0.1 >nul
  echo ^> App - quet ma QR bang Expo Go
  echo   Dong cua so "Nook server" de tat server.
  call npm run dev:fe
  goto :done
)
echo [x] Khong hieu "%WHAT%". Dung: run.bat [all^|be^|fe]

:fail
popd
exit /b 1

:done
popd
exit /b 0
