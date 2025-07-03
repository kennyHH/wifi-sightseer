export interface WiFiNetwork {
  MAC: string;
  SSID: string;
  AuthMode: string;
  FirstSeen: string;
  Channel: number;
  RSSI: number;
  CurrentLatitude: number;
  CurrentLongitude: number;
  AltitudeMeters: number;
  AccuracyMeters: number;
  Type: string;
}

export interface ParsedData {
  networks: WiFiNetwork[];
  totalNetworks: number;
  openNetworks: number;
  secureNetworks: number;
  enterpriseNetworks: number;
  outdatedNetworks: number;
  mostCommonSSID: string;
  mostCrowdedChannel: number;
  channelDistribution: { [key: number]: number };
  securityDistribution: {
    secure: number;
    warning: number;
    danger: number;
    enterprise: number;
  };
  manufacturerDistribution: { [key: string]: number };
  companyDistribution: { [key: string]: number };
}

export interface SecurityType {
  type: 'secure' | 'warning' | 'danger' | 'enterprise';
  color: string;
  label: string;
}
