
import React from 'react';
import { type Station } from '../types';

interface StationSelectorProps {
  label: string;
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station | null) => void;
  placeholder: string;
  otherStation: Station | null;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  label,
  stations,
  selectedStation,
  onSelectStation,
  placeholder,
  otherStation,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stationName = e.target.value;
    const station = stations.find(s => s.name === stationName) || null;
    onSelectStation(station);
  };

  return (
    <div>
      <label htmlFor={`station-select-${label}`} className="block mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        id={`station-select-${label}`}
        value={selectedStation?.name || ''}
        onChange={handleSelectChange}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-teal-500 focus:border-teal-500 transition"
      >
        <option value="" disabled>{placeholder}</option>
        {stations.map(station => (
          <option
            key={station.name}
            value={station.name}
            disabled={otherStation?.name === station.name}
            className="disabled:text-gray-500"
          >
            {station.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StationSelector;
