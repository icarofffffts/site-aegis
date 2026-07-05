# ============================================================
# Site Aegis - VPS Deploy Script
# ============================================================

$ErrorActionPreference = "Stop"

$VpsHost = "54.197.0.250"
$VpsUser = "ubuntu"
$PemKey = "c:/Users/Administrator/Desktop/Projetos/AegisBot/arxsenhass.pem"
$RemoteDir = "/var/www/aegis-site"

Write-Host ">> Preparando pacote de deploy..." -ForegroundColor Cyan
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }

# Criar área de staging e comprimir
if (Test-Path "temp_staging") { Remove-Item "temp_staging" -Recurse -Force }
New-Item -ItemType Directory -Path "temp_staging" -Force | Out-Null
robocopy . temp_staging /S /XD .git node_modules .tanstack .wrangler temp_staging /XF *.zip *.ps1 /NFL /NDL /NJH /NJS
Compress-Archive -Path "temp_staging/*" -DestinationPath "deploy.zip" -Force
Remove-Item "temp_staging" -Recurse -Force

Write-Host ">> Enviando para VPS..." -ForegroundColor Cyan
scp -i $PemKey -o StrictHostKeyChecking=no deploy.zip "$($VpsUser)@$($VpsHost):/tmp/aegis-deploy.zip"

Write-Host ">> Executando comandos remotos..." -ForegroundColor Cyan
$remoteCmd = @"
sudo mkdir -p $RemoteDir
sudo chown ubuntu:ubuntu $RemoteDir
cd $RemoteDir
unzip -o /tmp/aegis-deploy.zip
npm install --production --legacy-peer-deps
# Reiniciar via PM2 - Usando vite preview para servir o build SSR
pm2 delete aegis-site 2>/dev/null
pm2 start "npm run preview -- --port 3002 --host" --name aegis-site
pm2 save
rm /tmp/aegis-deploy.zip
"@

ssh -i $PemKey -o StrictHostKeyChecking=no "$($VpsUser)@$($VpsHost)" $remoteCmd

Write-Host ">> Deploy do Site Aegis concluído! 🚀" -ForegroundColor Green
