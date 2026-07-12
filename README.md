# MuVance Map View

Offline-first desktop workspace for RF mapping, heterogeneous radio scopes, floor-plan calibration, and confidence-aware occupancy research.

## Current milestone

- Electron-compatible React/TypeScript desktop shell
- Wi-Fi, BLE, CSI, and future SDR adapter model
- Live scopes, RF heat map, floor geometry, adapter manager, and detection lab
- Simulated inputs with explicit demo/validation labeling
- Probabilistic multi-source occupancy estimate with confidence
- Local recording state and automated spatial-engine tests
- Sandboxed Windows WLAN discovery for BSSID, channel, radio type, and signal percentage
- Persistent multi-floor building projects and imported floor-plan overlays
- Guided empty-room calibration with per-radio statistics and live deviation scoring
- Validated loopback-only UDP ingestion for Wi-Fi, BLE, CSI, and SDR bridges

This milestone does **not** claim operational human localization or vital-sign detection. Those features require supported CSI hardware, synchronized capture, room-specific calibration, and measured validation.

## Run

```powershell
npm install
npm run dev
```

Create the desktop installer with `npm run dist`.

Generated installers are written to `release/`; application web assets are isolated in `app-dist/` so normal builds never overwrite release artifacts.

### Blank window troubleshooting

Version 0.2.0 emitted absolute web asset paths and could open as an empty Electron window after installation. This is corrected in 0.2.1 and newer with relative packaged asset paths; startup failures now display a diagnostic dialog instead of a silent blank canvas.

## Architecture direction

Hardware integrations implement a normalized timestamped sample interface. The UI and fusion engine do not depend on a specific chipset. Planned providers include Windows WLAN RSSI, BLE advertisements, ESP32 CSI over UDP/serial, research NIC CSI, and SDR streams.

The first live bridge is available now: start the loopback UDP listener from the Detection Laboratory and follow [the sensor protocol](docs/sensor-protocol.md). A local development transmitter is included at `scripts/send-demo-sensor.mjs`.
