@echo off
REM ---------------------------------------------------------------------------
REM  Cai dat Nook — chay duoc nhieu lan, khong phai chi mot lan trong doi.
REM
REM    setup\win\install.bat          cai het
REM    setup\win\install.bat be       chi phan server
REM    setup\win\install.bat fe       chi phan app
REM
REM  Chay lai sau moi lan `git pull` la an toan: buoc nao xong roi thi bo qua.
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
  where docker >nul 2>&1 || (echo [x] Chua co Docker. Can no de chay Redis. & goto :fail)
  docker info >nul 2>&1  || (echo [x] Docker chua bat. Mo Docker Desktop roi chay lai. & goto :fail)
)

REM --- Thu vien --------------------------------------------------------------
echo.
echo ^> Thu vien
if not exist "node_modules" (
  call npm install || goto :fail
  echo   [v] server + goi dung chung
) else (
  call npm install --silent || goto :fail
  echo   . server — da co ^(da soat lai^)
)
if not "%WHAT%"=="be" (
  if not exist "frontend\node_modules" (
    call npm --prefix frontend install || goto :fail
    echo   [v] app
  ) else (
    echo   . app — da co
  )
)
if "%WHAT%"=="fe" (
  echo.
  echo ^> Xong
  echo   [v] chay: setup\win\run.bat fe
  goto :done
)

REM --- Bien moi truong -------------------------------------------------------
echo.
echo ^> Bien moi truong
if not exist "backend\.env" (
  copy /y "backend\.env.example" "backend\.env" >nul
  for /f "delims=" %%a in ('node -e "console.log(require(^'crypto^').randomBytes(48).toString(^'base64url^'))"') do set "ACCESS=%%a"
  for /f "delims=" %%a in ('node -e "console.log(require(^'crypto^').randomBytes(48).toString(^'base64url^'))"') do set "REFRESH=%%a"
  powershell -NoProfile -Command "(Get-Content 'backend\.env') -replace '^JWT_ACCESS_SECRET=.*', 'JWT_ACCESS_SECRET=%ACCESS%' -replace '^JWT_REFRESH_SECRET=.*', 'JWT_REFRESH_SECRET=%REFRESH%' | Set-Content 'backend\.env'"
  echo   [v] backend\.env — hai chuoi ky sinh ngau nhien
) else (
  echo   . backend\.env — da co, khong dung vao
)

REM --- Redis -----------------------------------------------------------------
echo.
echo ^> Redis
docker compose -f "%COMPOSE%" up -d >nul || goto :fail
echo   [v] cong 6380

REM --- Postgres --------------------------------------------------------------
REM  Windows thuong khong co Postgres cai san, nen de DB_PORT=5433 trong
REM  backend\.env va script se tu keo ban trong Docker len.
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
  echo     Chua co Postgres tren may? Doi DB_PORT trong backend\.env thanh 5433
  echo     roi chay lai — script se tu keo ban Docker len.
)

REM --- Goi dung chung + bang -------------------------------------------------
echo.
echo ^> Goi dung chung
call npm run build:shared --silent >nul || goto :fail
echo   [v] @nook/shared da dich

echo.
echo ^> Bang
call npm run migration:run --silent >nul || (echo [x] Migration hong — kiem lai ket noi Postgres. & goto :fail)
echo   [v] migration da chay toi ban moi nhat

echo.
echo ^> Xong
echo   [v] chay: setup\win\run.bat

:done
popd
exit /b 0

:fail
popd
exit /b 1
