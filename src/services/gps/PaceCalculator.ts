import type { GPSPoint } from '../../types/run';
import { haversineDistanceKm } from '../../utils/haversine';

const WINDOW_SECONDS = 30;

export class PaceCalculator {
  private points: GPSPoint[] = [];

  addPoint(point: GPSPoint): void {
    this.points.push(point);
    const cutoff = point.timestamp - WINDOW_SECONDS * 1000;
    this.points = this.points.filter((p) => p.timestamp >= cutoff);
  }

  getCurrentPaceSecPerKm(): number {
    if (this.points.length < 2) return 0;
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    const distKm = haversineDistanceKm(
      first.latitude, first.longitude,
      last.latitude, last.longitude
    );
    const durationSec = (last.timestamp - first.timestamp) / 1000;
    if (distKm < 0.001 || durationSec < 1) return 0;
    return durationSec / distKm;
  }

  reset(): void {
    this.points = [];
  }
}

export function calcAvgPaceSecPerKm(distanceKm: number, elapsedSeconds: number): number {
  if (distanceKm < 0.001) return 0;
  return elapsedSeconds / distanceKm;
}
