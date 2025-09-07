
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { type UserSettings, type Station } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSubwayData } from '../hooks/useSubwayData';
import { LoadingIcon, LocationIcon, ResetIcon, BellIcon, BellOffIcon } from './icons';

interface TrackingScreenProps {
  settings: UserSettings;
  onReset: () => void;
}

const NOTIFICATION_THRESHOLD_MIN = 2;

const TrackingScreen: React.FC<TrackingScreenProps> = ({ settings, onReset }) => {
  const { position, error: geoError, requestPermission: requestGeoPermission } = useGeolocation();
  const { line, startStation, endStation, findNearestStation, getTrainDirection } = useSubwayData(settings);
  
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [arrivalTime, setArrivalTime] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  
  const notificationSentForTrain = useRef<boolean>(false);

  const requestNotification = useCallback(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setNotificationPermission);
    }
  }, []);

  const sendNotification = useCallback((stationName: string, minutes: number) => {
    if (notificationPermission !== 'granted') return;
    
    const body = `${stationName}역에 ${minutes}분 후 도착 예정입니다.`;
    new Notification('지하철 도착 알림', {
      body,
      icon: '/favicon.ico', // You might want to replace this with a proper icon
      badge: '/favicon.ico',
    });
  }, [notificationPermission]);

  useEffect(() => {
    if (!position || !line) return;

    const closestStation = findNearestStation(position, line.stations);
    if (closestStation) {
      // Only update if the station has changed to avoid jitter
      if (closestStation.name !== nearestStation?.name) {
          setNearestStation(closestStation);
          notificationSentForTrain.current = false; // Reset notification status when station changes
      }
    }
  }, [position, line, findNearestStation, nearestStation?.name]);

  useEffect(() => {
    if (!nearestStation || !endStation || !line) return;

    const direction = getTrainDirection(nearestStation, endStation, line.stations);
    if (!direction) return;

    const calculateArrivalTime = () => {
      const now = Date.now();
      const cycle = 8 * 60 * 1000; // 8 minutes in ms
      const stationOffset = nearestStation.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1000;
      const timeIntoCycle = (now + stationOffset) % cycle;
      const newArrivalTime = Math.floor((cycle - timeIntoCycle) / 60000);
      
      if(newArrivalTime !== arrivalTime) {
         setArrivalTime(newArrivalTime);
      }

      if (newArrivalTime === NOTIFICATION_THRESHOLD_MIN && !notificationSentForTrain.current) {
        sendNotification(nearestStation.name, newArrivalTime);
        notificationSentForTrain.current = true;
      }
      
      if (newArrivalTime > NOTIFICATION_THRESHOLD_MIN) {
        notificationSentForTrain.current = false;
      }
    };
    
    calculateArrivalTime();
    const intervalId = setInterval(calculateArrivalTime, 1000);
    return () => clearInterval(intervalId);
  }, [nearestStation, endStation, line, getTrainDirection, sendNotification, arrivalTime]);

  const renderContent = () => {
    if (geoError) {
      return (
        <div className="text-center p-6 bg-red-900/50 rounded-lg">
          <p className="font-bold">위치 권한 오류</p>
          <p className="text-sm text-red-200 mt-2">{geoError}</p>
          <button onClick={requestGeoPermission} className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-500">
            권한 재요청
          </button>
        </div>
      );
    }

    if (!position || !nearestStation) {
      return (
        <div className="flex flex-col items-center gap-4">
          <LoadingIcon />
          <p className="text-lg text-gray-400 animate-pulse">현재 위치를 파악 중입니다...</p>
        </div>
      );
    }
    
    const direction = getTrainDirection(nearestStation, endStation, line?.stations || []);

    return (
      <div className="text-center w-full flex flex-col items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <LocationIcon />
          <span>현재 역</span>
        </div>
        <h2 className="text-5xl font-extrabold my-2 text-white">{nearestStation.name}</h2>
        <p className="text-xl text-teal-400">{endStation?.name} 방면</p>
        
        <div className="my-10 w-full h-48 flex items-center justify-center bg-gray-800 rounded-full border-4 border-gray-700 shadow-inner">
          {arrivalTime !== null && direction ? (
            <div className="text-center">
              <p className="text-7xl font-mono font-bold text-teal-300">{arrivalTime}</p>
              <p className="text-2xl text-gray-300">분 후 도착</p>
            </div>
          ) : (
            <p className="text-gray-500">도착 정보 없음</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 w-full relative animate-fade-in">
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={requestNotification} className="p-2 text-gray-400 hover:text-white transition">
                {notificationPermission === 'granted' ? <BellIcon /> : <BellOffIcon />}
            </button>
            <button onClick={onReset} className="p-2 text-gray-400 hover:text-white transition">
                <ResetIcon />
            </button>
        </div>
        <div className="text-center">
            <h1 className="text-2xl font-bold text-teal-400 flex items-center justify-center gap-2">
                <div className={`w-4 h-4 rounded-full ${line?.color || 'bg-gray-500'}`}></div>
                <span>{settings.lineName}</span>
            </h1>
            <p className="text-gray-400">{startStation?.name} → {endStation?.name}</p>
        </div>
      
        <div className="mt-4 flex justify-center items-center h-full">
            {renderContent()}
        </div>
    </div>
  );
};

export default TrackingScreen;
