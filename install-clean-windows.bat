@echo off
echo Configurando NPM para o registry oficial...
npm config set registry https://registry.npmjs.org/

echo Limpando instalacao anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache clean --force

echo Instalando dependencias...
npm install

echo.
echo Pronto. Para rodar o projeto use:
echo npm run dev
pause
