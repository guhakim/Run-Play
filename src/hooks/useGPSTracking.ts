import { useEffect, useRef } from 'react';
import { LocationService } from '../services/gps/LocationService';
import { PaceCalculator, calcAvgPaceSecPerKm } from '../services/gps/PaceCalculator';
import { haversineDistanceKm } from '../utils/haversine';
import { useRunStore } from '../stores/useRunStore';
import type { GPSPoint } from '../types/run';

export function useGPSTracking(
  isActive: boolean,
  onNewPoint: (point: GPSPoint) => void
): void {
  const paceCalc = useRef(new PaceCalculator());
  const lastPoint = useRef<GPSPoint | null>(null);
  const { addGPSPoint, updateDistanceAndPace, totalDistanceKm, elapsedSeconds, status } = useRunStore();

  useEffect(() => {
    if (!isActive) return;

    LocationService.startTracking((point) => {
      if (status !== 'active') return;

      addGPSPoint(point);
      paceCalc.current.addPoint(point);

      let addedDistKm = 0;
      if (lastPoint.current) {
        addedDistKm = haversineDistanceKm(
          lastPoint.current.latitude, lastPoint.current.longitude,
          point.latitude, point.longitude
        );
      }
      lastPoint.current = point;

      const newTotal = totalDistanceKm + addedDistKm;
      const currentPace = paceCalc.current.getCurrentPaceSecPerKm();
      const avgPace = calcAvgPaceSecPerKm(newTotal, elapsedSeconds);

      updateDistanceAndPace(newTotal, currentPace, avgPace);
      onNewPoint(point);
    });

    return () => {
      LocationService.stopTracking();
      paceCalc.current.reset();
      lastPoint.current = null;
    };
  }, [isActive]);
}
