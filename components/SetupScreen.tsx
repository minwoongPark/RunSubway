
import React, { useState, useMemo } from 'react';
import { type UserSettings, type Station } from '../types';
import { SUBWAY_DATA } from '../constants';
import StationSelector from './StationSelector';

interface SetupScreenProps {
  onSave: (settings: UserSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSave }) => {
  const [selectedLineName, setSelectedLineName] = useState<string>(SUBWAY_DATA[0].name);
  const [startStation, setStartStation] = useState<Station | null>(null);
  const [endStation, setEndStation] = useState<Station | null>(null);

  const selectedLine = useMemo(() => {
    return SUBWAY_DATA.find(line => line.name === selectedLineName) || SUBWAY_DATA[0];
  }, [selectedLineName]);

  const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLineName(e.target.value);
    setStartStation(null);
    setEndStation(null);
  };
  
  const handleSave = () => {
    if (selectedLine && startStation && endStation) {
      onSave({
        lineName: selectedLine.name,
        startStationName: startStation.name,
        endStationName: endStation.name,
      });
    }
  };

  const isFormComplete = selectedLineName && startStation && endStation && startStation.name !== endStation.name;

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 w-full animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-400">지하철 도착 알리미</h1>
        <p className="text-gray-400 mt-2">이용하실 노선과 목적지를 설정해주세요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="line-select" className="block mb-2 text-sm font-medium text-gray-300">노선 선택</label>
          <select
            id="line-select"
            value={selectedLineName}
            onChange={handleLineChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-teal-500 focus:border-teal-500 transition"
          >
            {SUBWAY_DATA.map(line => (
              <option key={line.name} value={line.name}>{line.name}</option>
            ))}
          </select>
        </div>
        
        <StationSelector 
          label="출발역 (자동 감지)"
          stations={selectedLine.stations}
          selectedStation={startStation}
          onSelectStation={setStartStation}
          placeholder="나중에 GPS로 자동 감지됩니다"
          otherStation={endStation}
        />

        <StationSelector 
          label="도착역"
          stations={selectedLine.stations}
          selectedStation={endStation}
          onSelectStation={setEndStation}
          placeholder="목적지를 선택하세요"
          otherStation={startStation}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isFormComplete}
        className="w-full p-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        알림 시작
      </button>
    </div>
  );
};

export default SetupScreen;
