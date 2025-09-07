
import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import TrackingScreen from './components/TrackingScreen';
import { type UserSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('subwayAlarmSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      localStorage.removeItem('subwayAlarmSettings');
    }
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    localStorage.setItem('subwayAlarmSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const handleResetSettings = () => {
    localStorage.removeItem('subwayAlarmSettings');
    setSettings(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {settings ? (
          <TrackingScreen settings={settings} onReset={handleResetSettings} />
        ) : (
          <SetupScreen onSave={handleSaveSettings} />
        )}
      </div>
    </div>
  );
};

export default App;
