# MuVance local sensor protocol v1

The desktop listener accepts UTF-8 JSON over UDP at `127.0.0.1:5006`. It is loopback-only by design. A hardware-specific bridge reads serial, driver, BLE, or CSI data and emits normalized frames locally.

Send either one object or an array of objects:

```json
{
  "adapterId": "esp32-csi-01",
  "kind": "csi",
  "timestamp": 1783818000000,
  "rssi": -54.2,
  "phase": 1.91,
  "amplitude": 0.74,
  "motion": 0.18,
  "channel": 6
}
```

Required fields:

| Field | Meaning |
| --- | --- |
| `adapterId` | Stable source identifier, maximum 80 characters |
| `kind` | `wifi`, `ble`, `csi`, or `sdr` |
| `timestamp` | Unix epoch milliseconds; the receiver supplies the current time when omitted |
| `rssi` | Signal strength in dBm, clamped to -140 through 20 |
| `phase` | Aggregate or selected-subcarrier phase in radians |
| `amplitude` | Non-negative normalized amplitude |
| `motion` | Non-negative derived motion energy |
| `channel` | Wi-Fi/BLE/logical channel number |

Malformed datagrams and invalid frames are discarded. The v1 listener does not accept remote network connections, execute commands, or persist packet payloads.

## Development simulator

Start the sensor listener from **Detection laboratory**, then run:

```powershell
node scripts/send-demo-sensor.mjs
```

Stop the simulator with `Ctrl+C`.
