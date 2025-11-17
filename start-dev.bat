@echo off
echo ====================================
echo Sistema de Inventario de Medicamentos
echo ====================================
echo.
echo Iniciando servicios...
echo.

REM Verificar que Node.js esté instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar que MySQL esté corriendo
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Iniciando MySQL...
    net start MySQL80
)

echo.
echo Abriendo Backend en una nueva ventana...
start "Backend - Puerto 4000" cmd /k "cd /d backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Abriendo Frontend en una nueva ventana...
start "Frontend - Puerto 5173" cmd /k "cd /d frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ====================================
echo Servicios iniciados correctamente
echo ====================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:5173

exit


