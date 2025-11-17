# Script para separar backend y frontend en repositorios independientes
# Ejecutar: .\separar-repositorios.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Separar Repositorios - Backend y Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar usuario de GitHub
$githubUser = Read-Host "Ingresa tu usuario de GitHub"

if ([string]::IsNullOrWhiteSpace($githubUser)) {
    Write-Host "❌ Error: Debes ingresar tu usuario de GitHub" -ForegroundColor Red
    exit 1
}

# URLs de los repositorios
$backendRepo = "https://github.com/$githubUser/inventario-medicamentos-backend.git"
$frontendRepo = "https://github.com/$githubUser/inventario-medicamentos-frontend.git"

Write-Host ""
Write-Host "📋 Repositorios que se crearán:" -ForegroundColor Yellow
Write-Host "   Backend:  $backendRepo" -ForegroundColor White
Write-Host "   Frontend: $frontendRepo" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "¿Los repositorios ya existen en GitHub? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Primero crea los repositorios en GitHub:" -ForegroundColor Yellow
    Write-Host "   1. Ve a https://github.com/new" -ForegroundColor White
    Write-Host "   2. Crea: inventario-medicamentos-backend" -ForegroundColor White
    Write-Host "   3. Crea: inventario-medicamentos-frontend" -ForegroundColor White
    Write-Host "   4. NO marques 'Initialize with README'" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Presiona Enter cuando hayas creado los repositorios..."
}

# Obtener ruta del proyecto
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectPath "backend"
$frontendPath = Join-Path $projectPath "frontend"

# Verificar que las carpetas existan
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta frontend" -ForegroundColor Red
    exit 1
}

# ============================================
# BACKEND
# ============================================
Write-Host ""
Write-Host "🚀 Preparando Backend..." -ForegroundColor Green
Write-Host ""

$backendTemp = Join-Path $projectPath "backend-temp"
if (Test-Path $backendTemp) {
    Remove-Item -Path $backendTemp -Recurse -Force
}

New-Item -ItemType Directory -Path $backendTemp | Out-Null

# Copiar archivos del backend
Write-Host "📁 Copiando archivos del backend..." -ForegroundColor Yellow
Get-ChildItem -Path $backendPath -Exclude node_modules | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $backendTemp -Recurse -Force
}

# Inicializar git
Set-Location $backendTemp
Write-Host "🔧 Inicializando repositorio Git..." -ForegroundColor Yellow
git init | Out-Null
git add . | Out-Null
git commit -m "Initial commit: Backend API" | Out-Null

# Agregar remoto
Write-Host "🔗 Configurando repositorio remoto..." -ForegroundColor Yellow
git remote add origin $backendRepo 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin $backendRepo
}

# Cambiar a main
git branch -M main | Out-Null

# Push
Write-Host "📤 Subiendo backend a GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend subido correctamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error al subir backend. Verifica que el repositorio exista y tengas permisos." -ForegroundColor Yellow
}

Set-Location $projectPath

# ============================================
# FRONTEND
# ============================================
Write-Host ""
Write-Host "🚀 Preparando Frontend..." -ForegroundColor Green
Write-Host ""

$frontendTemp = Join-Path $projectPath "frontend-temp"
if (Test-Path $frontendTemp) {
    Remove-Item -Path $frontendTemp -Recurse -Force
}

New-Item -ItemType Directory -Path $frontendTemp | Out-Null

# Copiar archivos del frontend
Write-Host "📁 Copiando archivos del frontend..." -ForegroundColor Yellow
Get-ChildItem -Path $frontendPath -Exclude node_modules | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $frontendTemp -Recurse -Force
}

# Inicializar git
Set-Location $frontendTemp
Write-Host "🔧 Inicializando repositorio Git..." -ForegroundColor Yellow
git init | Out-Null
git add . | Out-Null
git commit -m "Initial commit: Frontend React" | Out-Null

# Agregar remoto
Write-Host "🔗 Configurando repositorio remoto..." -ForegroundColor Yellow
git remote add origin $frontendRepo 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin $frontendRepo
}

# Cambiar a main
git branch -M main | Out-Null

# Push
Write-Host "📤 Subiendo frontend a GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend subido correctamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error al subir frontend. Verifica que el repositorio exista y tengas permisos." -ForegroundColor Yellow
}

Set-Location $projectPath

# ============================================
# LIMPIEZA
# ============================================
Write-Host ""
Write-Host "🧹 Limpiando carpetas temporales..." -ForegroundColor Yellow
if (Test-Path $backendTemp) {
    Remove-Item -Path $backendTemp -Recurse -Force
}
if (Test-Path $frontendTemp) {
    Remove-Item -Path $frontendTemp -Recurse -Force
}

# ============================================
# RESUMEN
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Repositorios creados:" -ForegroundColor Yellow
Write-Host "   Backend:  https://github.com/$githubUser/inventario-medicamentos-backend" -ForegroundColor White
Write-Host "   Frontend: https://github.com/$githubUser/inventario-medicamentos-frontend" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Verifica los repositorios en GitHub" -ForegroundColor White
Write-Host "   2. Conecta cada repositorio a Railway" -ForegroundColor White
Write-Host "   3. Configura las variables de entorno" -ForegroundColor White
Write-Host ""
Write-Host "📖 Lee SEPARAR-REPOSITORIOS.md para más detalles" -ForegroundColor Cyan
Write-Host ""

