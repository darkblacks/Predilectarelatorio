@echo off
setlocal
cd /d "%~dp0"
title Predilecta - Dashboard Operacional

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js e execute este arquivo novamente.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando a apresentacao...
call npm run dev
pause
