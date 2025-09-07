import { useState, useEffect, useCallback } from 'react';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(() => {
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    let watcherId: number;

    // FIX: Explicitly use the global GeolocationPosition type to avoid name collision
    // with the local interface. The global type has the `coords` property.
    const successCallback = (pos: globalThis.GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setError(null);
    };

    const errorCallback = (err: GeolocationPositionError) => {
      let message = '위치 정보를 가져올 수 없습니다.';
      if (err.code === 1) {
        message = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
      }
      setError(message);
    };

    if ('geolocation' in navigator) {
      watcherId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('이 브라우저에서는 위치 정보 기능을 사용할 수 없습니다.');
    }

    return () => {
      if (watcherId) {
        navigator.geolocation.clearWatch(watcherId);
      }
    };
  }, []);

  return { position, error, requestPermission };
};
