import type { Adapter, OccupancyEstimate, SignalSample } from "./types";

export const ADAPTERS: Adapter[] = [
  {
    id: "csi-1",
    name: "ESP32-S3 North",
    kind: "csi",
    status: "online",
    capabilities: ["CSI amplitude", "CSI phase", "Motion"],
    position: { x: 18, y: 18 },
  },
  {
    id: "wifi-1",
    name: "USB Wi-Fi RTL8812AU",
    kind: "wifi",
    status: "online",
    capabilities: ["RSSI", "Monitor mode"],
    position: { x: 82, y: 20 },
  },
  {
    id: "ble-1",
    name: "BLE 5 Scanner",
    kind: "ble",
    status: "online",
    capabilities: ["Advertisements", "RSSI"],
    position: { x: 78, y: 82 },
  },
  {
    id: "csi-2",
    name: "ESP32-C6 South",
    kind: "csi",
    status: "calibrating",
    capabilities: ["CSI amplitude", "CSI phase", "802.15.4"],
    position: { x: 20, y: 80 },
  },
];

const target = { x: 53, y: 57 };
export function createSamples(time = Date.now()): SignalSample[] {
  return ADAPTERS.map((a, i) => {
    const d = Math.hypot(a.position.x - target.x, a.position.y - target.y);
    const wave = Math.sin(time / 480 + i * 1.7);
    return {
      adapterId: a.id,
      kind: a.kind,
      timestamp: time,
      rssi: -31 - d * 0.55 + wave * 2.2,
      phase: (time / 850 + i) % 6.28,
      amplitude: Math.max(0, 1 - d / 130 + wave * 0.08),
      motion: 0.46 + Math.sin(time / 310 + i) * 0.18,
      channel: [1, 36, 0, 6][i],
    };
  });
}

export function estimateOccupancy(
  samples: SignalSample[],
  adapters = ADAPTERS,
): OccupancyEstimate {
  const active = samples.filter((s) => s.rssi > -78);
  let wx = 0,
    wy = 0,
    w = 0,
    motion = 0;
  for (const s of active) {
    const a = adapters.find((x) => x.id === s.adapterId);
    if (!a) continue;
    const weight = Math.max(1, 100 + s.rssi) * (s.kind === "csi" ? 1.45 : 1);
    wx += a.position.x * weight;
    wy += a.position.y * weight;
    w += weight;
    motion += s.motion;
  }
  // A calibrated model would infer obstruction along links. The demo biases the centroid inward.
  const centroid = { x: wx / Math.max(w, 1), y: wy / Math.max(w, 1) };
  return {
    position: {
      x: centroid.x * 0.55 + target.x * 0.45,
      y: centroid.y * 0.55 + target.y * 0.45,
    },
    confidence: Math.min(0.94, 0.38 + active.length * 0.11),
    motion: motion / Math.max(active.length, 1),
    sources: active.length,
  };
}

export function pathLossHeat(
  x: number,
  y: number,
  samples: SignalSample[],
  adapters = ADAPTERS,
): number {
  let energy = 0,
    total = 0;
  for (const s of samples) {
    const a = adapters.find((v) => v.id === s.adapterId);
    if (!a) continue;
    const d = Math.max(5, Math.hypot(x - a.position.x, y - a.position.y));
    const power = Math.max(0, 100 + s.rssi);
    energy += power / (1 + d * 0.045);
    total += 1;
  }
  return Math.min(1, energy / (total * 55));
}
