param (
    [switch]$DryRun
)

$VpsUser = "ubuntu"
$VpsIp   = "54.197.0.250"
$SshKey  = "C:\Users\Administrator\Downloads\arxsenhass.pem"
$VpsPath = "/var/www/aegis-site"
$ServiceName = "aegis.service"
$Timestamp   = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir   = "${VpsPath}/backups/dist-${Timestamp}"
$TarFile     = "aegis-dist-deploy.tar.gz"

if ($DryRun) {
    Write-Host "[DRY RUN]" -ForegroundColor Magenta
    Write-Host "Target VPS Path : $VpsPath"
    Write-Host "Archive         : $TarFile  (dist/ compactado)"
    Write-Host "Service         : $ServiceName"
    Write-Host "Backup path     : $BackupDir"
    Write-Host "No changes executed." -ForegroundColor Yellow
    exit 0
}

Write-Host "--- Starting Deployment for SiteAegis ---" -ForegroundColor Cyan

# 1. Build local
Write-Host "[1/6] Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }
Write-Host "Build OK." -ForegroundColor Green

# 2. Compactar dist/ em um único arquivo
Write-Host "[2/6] Compressing dist/ -> $TarFile ..." -ForegroundColor Yellow
if (Test-Path $TarFile) { Remove-Item $TarFile -Force }
tar -czf $TarFile -C . dist
if ($LASTEXITCODE -ne 0) { Write-Host "Compression failed!" -ForegroundColor Red; exit 1 }
$SizeMB = [math]::Round((Get-Item $TarFile).Length / 1MB, 2)
Write-Host "Compressed: ${SizeMB} MB" -ForegroundColor Green

# 3. Upload — um único arquivo + start.mjs
Write-Host "[3/6] Uploading $TarFile to VPS..." -ForegroundColor Yellow
scp -i $SshKey -o StrictHostKeyChecking=no $TarFile "${VpsUser}@${VpsIp}:/tmp/${TarFile}"
if ($LASTEXITCODE -ne 0) { Write-Host "Upload failed!" -ForegroundColor Red; exit 1 }
# Envia o wrapper SSR junto
scp -i $SshKey -o StrictHostKeyChecking=no .\start.mjs "${VpsUser}@${VpsIp}:${VpsPath}/start.mjs"
Write-Host "Upload OK." -ForegroundColor Green

# 4. Backup + extração + sync de dependências no VPS
Write-Host "[4/6] Backup + extracting on VPS..." -ForegroundColor Yellow
$RemoteCmd = @"
set -e
mkdir -p ${BackupDir}
rsync -a ${VpsPath}/dist/ ${BackupDir}/ 2>/dev/null || true
sudo rm -rf ${VpsPath}/dist
sudo mkdir -p ${VpsPath}/dist
sudo tar -xzf /tmp/${TarFile} -C ${VpsPath}
sudo chown -R ubuntu:ubuntu ${VpsPath}/dist
rm /tmp/${TarFile}
cd ${VpsPath} && npm install --omit=dev --silent 2>/dev/null || true
"@
ssh -i $SshKey -o StrictHostKeyChecking=no "${VpsUser}@${VpsIp}" $RemoteCmd
if ($LASTEXITCODE -ne 0) { Write-Host "Remote extraction failed!" -ForegroundColor Red; exit 1 }
Write-Host "Extraction OK." -ForegroundColor Green

# 5. Reiniciar serviço
Write-Host "[5/6] Restarting $ServiceName..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no "${VpsUser}@${VpsIp}" "sudo systemctl restart $ServiceName"
if ($LASTEXITCODE -ne 0) { Write-Host "Service restart failed!" -ForegroundColor Red; exit 1 }
Write-Host "Service restarted." -ForegroundColor Green

# 6. Verificação
Write-Host "[6/6] Verifying service..." -ForegroundColor Yellow
$Status = ssh -i $SshKey -o StrictHostKeyChecking=no "${VpsUser}@${VpsIp}" "systemctl is-active $ServiceName"
if ($Status -eq "active") {
    Write-Host "Service is ONLINE." -ForegroundColor Green
} else {
    Write-Host "Service is NOT online (status: $Status)." -ForegroundColor Red
    exit 1
}

# Limpeza local
Remove-Item $TarFile -Force

Write-Host "--- Deployment Complete ($Timestamp) ---" -ForegroundColor Cyan
