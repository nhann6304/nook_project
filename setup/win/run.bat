@echo off
REM ---------------------------------------------------------------------------
REM  Chay Nook tren may dev — mot lenh, tu may trang cung chay duoc.
REM
REM    setup\win\run.bat          bat ca server lan app
REM    setup\win\run.bat be       chi server
REM    setup\win\run.bat fe       chi app
REM
REM  Lan dau chay se tu: cai thu vien, dung .env, keo Postgres + Redis ve, va
REM  chay migration. Nhung lan sau se bo qua may buoc da xong.
REM ---------------------------------------------------------------------------
setlocal enabledelayedexpansion

set "ROOT=%~dp0..\.."
pushd "%ROOT%" || (echo Khong vao duoc thu muc goc & exit /b 1)
set "COMPOSE=backend\docker\compose.dev.yml"
set "WHAT=%~1"
if "%WHAT%"=="" set "WHAT=all"

REM --- Kiem nhung thu phai co san -------------------------------------------
where node >nul 2>&1 || (echo [x] Chua co Node. Cai ban 22 hoac 24. & goto :fail)
for /f "delims=" %%v in ('node -p "process.versions.node.split(^'.^')[0]"') do set "NODEMAJOR=%%v"
if not "%NODEMAJOR%"=="22" if not "%NODEMAJOR%"=="24" (
  echo   ! Node v%NODEMAJOR% — may thu vien o day chi hua chay tren 22 hoac 24.
)

if not "%WHAT%"=="fe" (
  where docker >nul 2>&1 || (echo [x] Chua co Docker. & goto :fail)
  docker info >nul 2>&1  || (echo [x] Docker chua bat. Mo Docker Desktop roi chay lai. & goto :fail)
)

REM --- Thu vien --------------------------------------------------------------
echo.
echo ^> Thu vien
if not exist "node_modules" (
  call npm install || goto :fail
  echo   [v] da cai ^(server + goi dung chung^)
) else (
  echo   . server — da co
)
if not "%WHAT%"=="be" (
  if not exist "frontend\node_modules" (
    call npm --prefix frontend install || goto :fail
    echo   [v] da cai ^(app^)
  ) else (
    echo   . app — da co
  )
)

if "%WHAT%"=="fe" goto :run

REM --- Bien moi truong -------------------------------------------------------
echo.
echo ^> Bien moi truong
if not exist "backend\.env" (
  copy /y "backend\.env.example" "backend\.env" >nul
  for /f "delims=" %%a in ('node -e "console.log(require(^'crypto^').randomBytes(48).toString(^'base64url^'))"') do set "ACCESS=%%a"
  for /f "delims=" %%a in ('node -e "console.log(require(^'crypto^').randomBytes(48).toString(^'base64url^'))"') do set "REFRESH=%%a"
  powershell -NoProfile -Command "(Get-Content 'backend\.env') -replace '^JWT_ACCESS_SECRET=.*', 'JWT_ACCESS_SECRET=%ACCESS%' -replace '^JWT_REFRESH_SECRET=.*', 'JWT_REFRESH_SECRET=%REFRESH%' | Set-Content 'backend\.env'"
  echo   [v] backend\.env dung xong, hai chuoi ky sinh ngau nhien
) else (
  echo   . backend\.env — da co
)

REM --- Redis -----------------------------------------------------------------
echo.
echo ^> Redis
docker compose -f "%COMPOSE%" up -d >nul || goto :fail
echo   [v] Redis 6380

REM --- Postgres --------------------------------------------------------------
REM  Mac thi dung ban Postgres cai bang Homebrew (cong 5432). Windows thi
REM  thuong khong co, nen de DB_PORT=5433 trong backend\.env va script se tu
REM  keo ban trong Docker len.
echo.
echo ^> Postgres
set "DBPORT="
for /f "tokens=1,* delims==" %%a in ('type "backend\.env" ^| findstr /b "DB_PORT="') do set "DBPORT=%%b"
if "%DBPORT%"=="5433" (
  docker compose -f "%COMPOSE%" --profile db up -d >nul || goto :fail
  echo   . cho co so du lieu mo cua
  set "READY="
  for /l %%i in (1,1,60) do (
    if not defined READY (
      docker compose -f "%COMPOSE%" exec -T db pg_isready -U nook -d nook >nul 2>&1 && set "READY=1"
      if not defined READY ping -n 2 127.0.0.1 >nul
    )
  )
  if not defined READY (
    echo [x] Postgres trong Docker khong len. Xem: docker compose -f %COMPOSE% logs db
    goto :fail
  )
  echo   [v] Postgres Docker, cong 5433
) else (
  echo   . dung Postgres tren may, cong %DBPORT%
)

REM --- Bang ------------------------------------------------------------------
echo.
echo ^> Bang
call npm run migration:run --silent >nul || goto :fail
echo   [v] migration da chay toi ban moi nhat

:run
echo.
if "%WHAT%"=="be" (
  echo ^> Server — http://localhost:4000/docs
  call npm run dev:be
  goto :done
)
if "%WHAT%"=="fe" (
  echo ^> App — quet ma QR bang Expo Go
  call npm run dev:fe
  goto :done
)
if "%WHAT%"=="all" (
  echo ^> Server — mo o cua so rieng, http://localhost:4000/docs
  start "Nook server" cmd /k "cd /d %ROOT% && npm run dev:be"
  ping -n 3 127.0.0.1 >nul
  echo ^> App — quet ma QR bang Expo Go
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
