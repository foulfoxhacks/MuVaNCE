import { describe, expect, it } from 'vitest';
import { ADAPTERS, createSamples, estimateOccupancy, pathLossHeat } from './engine';

describe('spatial engine', () => {
  it('produces one normalized sample per adapter', () => {
    const samples=createSamples(1_000);
    expect(samples).toHaveLength(ADAPTERS.length);
    expect(samples.every(s=>s.amplitude>=0&&Number.isFinite(s.rssi))).toBe(true);
  });
  it('returns bounded occupancy evidence', () => {
    const estimate=estimateOccupancy(createSamples(2_000));
    expect(estimate.confidence).toBeGreaterThan(0);
    expect(estimate.confidence).toBeLessThanOrEqual(1);
    expect(estimate.position.x).toBeGreaterThanOrEqual(0);
    expect(estimate.position.x).toBeLessThanOrEqual(100);
  });
  it('returns bounded heat intensity', () => {
    expect(pathLossHeat(50,50,createSamples(3_000))).toBeGreaterThanOrEqual(0);
    expect(pathLossHeat(50,50,createSamples(3_000))).toBeLessThanOrEqual(1);
  });
});
