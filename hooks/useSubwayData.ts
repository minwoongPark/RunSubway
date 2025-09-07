
import { useMemo, useCallback } from 'react';
import { type UserSettings, type Station } from '../types';
import { SUBWAY_DATA } from '../constants';

// Haversine formula to calculate distance between two lat/lng points
const getDistance = (pos1: { latitude: number; longitude: number }, pos2: { lat: number; lng: number }): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (pos2.lat - pos1.latitude) * (Math.PI / 180);
  const dLon = (pos2.lng - pos1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.latitude * (Math.PI / 180)) * Math.cos(pos2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const useSubwayData = (settings: UserSettings) => {
  const line = useMemo(() => SUBWAY_DATA.find(l => l.name === settings.lineName) || null, [settings.lineName]);
  
  const startStation = useMemo(() => line?.stations.find(s => s.name === settings.startStationName) || null, [line, settings.startStationName]);
  const endStation = useMemo(() => line?.stations.find(s => s.name === settings.endStationName) || null, [line, settings.endStationName]);

  const findNearestStation = useCallback((position: { latitude: number; longitude: number }, stations: Station[]): Station | null => {
    if (!stations || stations.length === 0) return null;

    let closestStation: Station | null = null;
    let minDistance = Infinity;

    for (const station of stations) {
      const distance = getDistance(position, station);
      if (distance < minDistance) {
        minDistance = distance;
        closestStation = station;
      }
    }
    
    // Only consider it a valid "nearest" station if it's within a reasonable range, e.g., 2km
    return minDistance < 2 ? closestStation : null;
  }, []);

  const getTrainDirection = useCallback((current: Station, destination: Station, stations: Station[]): 'clockwise' | 'counter-clockwise' | null => {
      if(!current || !destination || !stations || stations.length === 0) return null;

      const currentIndex = stations.findIndex(s => s.name === current.name);
      const destinationIndex = stations.findIndex(s => s.name === destination.name);

      if(currentIndex === -1 || destinationIndex === -1) return null;

      // For a circular line like Line 2
      const forwardDistance = (destinationIndex - currentIndex + stations.length) % stations.length;
      const backwardDistance = (currentIndex - destinationIndex + stations.length) % stations.length;

      return forwardDistance < backwardDistance ? 'clockwise' : 'counter-clockwise';
  }, []);

  return { line, startStation, endStation, findNearestStation, getTrainDirection };
};
