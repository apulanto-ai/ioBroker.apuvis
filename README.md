# ioBroker.apuvis

Modernes, interaktives ioBroker-Dashboard als Adapter. Ersetzt den alten VIS-Adapter durch eine React-basierte SPA mit Setup-Wizard.

## Features

- **Setup-Wizard** beim ersten Start — Räume und Widgets automatisch aus ioBroker erkunden
- **Live-Daten** via socket.io (Web-Adapter)
- **Widgets**: Schalter, Licht (Dimmer), Thermostat, Sensor, Diagramm (History), Kamera (MJPEG), Wetter, Grafana
- **Drag & Drop** Layout im Bearbeiten-Modus
- **Dunkles Design**, konfigurierbare Akzentfarben

## Installation

### Über ioBroker Admin (empfohlen)

1. ioBroker Admin öffnen → **Adapter** → **Von URL installieren** (GitHub-Icon oben)
2. URL eingeben:
   ```
   https://github.com/apulanto-ai/ioBroker.apuvis
   ```
3. Installieren → Instanz erstellen
4. Dashboard öffnen: `http://<iobroker-ip>:8082/apuvis/`

### Voraussetzungen

- **iobroker.web** Adapter ≥ 4.0.0 (aktiv)
- **js-controller** ≥ 5.0.0

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# ioBroker-IP in .env.local eintragen:
echo "VITE_IOBROKER_URL=http://10.0.0.111:8082" > .env.local

# Dev-Server mit Hot-Reload starten
npm run dev

# Production-Build (→ www/)
npm run build
```

## Lizenz

MIT © apulanto
