
export interface Station {
  name: string;
  lat: number;
  lng: number;
}

export interface Line {
  name: string;
  color: string;
  stations: Station[];
}

export interface UserSettings {
  lineName: string;
  startStationName: string;
  endStationName: string;
}
