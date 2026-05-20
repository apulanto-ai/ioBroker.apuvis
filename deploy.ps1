# apuVIS Deploy Script
# Kopiert den Build nach ioBroker: http://<IOBROKER_HOST>:8082/apuvis/
#
# Voraussetzung: SSH-Zugang zu ioBroker (z.B. ssh pi@10.0.0.111)
# Anpassen:
$IOBROKER_HOST = "10.0.0.111"
$IOBROKER_USER = "pi"          # SSH-Nutzer (oft "pi", "iobroker" oder "root")
$REMOTE_PATH   = "/opt/iobroker/node_modules/iobroker.web/www/apuvis"

Write-Host "Baue apuVIS..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build fehlgeschlagen"; exit 1 }

Write-Host "Erstelle Zielordner auf ioBroker..." -ForegroundColor Cyan
ssh "${IOBROKER_USER}@${IOBROKER_HOST}" "mkdir -p $REMOTE_PATH"

Write-Host "Kopiere dist/ nach ioBroker..." -ForegroundColor Cyan
scp -r dist/* "${IOBROKER_USER}@${IOBROKER_HOST}:${REMOTE_PATH}/"

Write-Host ""
Write-Host "Fertig! Oeffne im Browser:" -ForegroundColor Green
Write-Host "  http://${IOBROKER_HOST}:8082/apuvis/" -ForegroundColor Yellow
