import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { WiFiNetwork } from '@/types/wifi';
import { determineSecurityType, getDetailedSecurity, getManufacturer } from '@/utils/csvParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WiFiMapProps {
  networks: WiFiNetwork[];
}

// Custom icons for different security types
const createCustomIcon = (securityType: string) => {
  const colors = {
    secure: 'hsl(142, 76%, 36%)',      // Green
    warning: 'hsl(43, 96%, 56%)',     // Yellow  
    danger: 'hsl(0, 84%, 60%)',       // Red
    enterprise: 'hsl(217, 91%, 60%)'  // Blue
  };

  const color = colors[securityType as keyof typeof colors] || colors.warning;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Component to auto-fit map bounds
const MapBounds: React.FC<{ networks: WiFiNetwork[] }> = ({ networks }) => {
  const map = useMap();

  useEffect(() => {
    if (networks.length > 0) {
      const bounds = L.latLngBounds(
        networks.map(network => [network.CurrentLatitude, network.CurrentLongitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [networks, map]);

  return null;
};

// Component to handle map resizing when its container becomes visible
const MapResizeHandler: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
};


const getSecurityBadgeVariant = (securityType: string) => {
  switch (securityType) {
    case 'secure':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'danger':
      return 'destructive';
    case 'enterprise':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getSecurityLabel = (securityType: string) => {
  switch (securityType) {
    case 'secure':
      return 'Secure';
    case 'warning':
      return 'Outdated';
    case 'danger':
      return 'Insecure';
    case 'enterprise':
      return 'Enterprise';
    default:
      return 'Unknown';
  }
};

const WiFiMap: React.FC<WiFiMapProps> = ({ networks }) => {
  const [securityFilter, setSecurityFilter] = useState('all');

  const filteredNetworks = networks.filter(network => {
    if (securityFilter === 'all') return true;
    const securityType = determineSecurityType(network.AuthMode);
    return securityType === securityFilter;
  });

  if (networks.length === 0) {
    return (
      <Card className="h-[70vh] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">No location data available to display on map</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[70vh]">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">WiFi Network Locations</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secure"></div>
              <span className="text-muted-foreground">Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-muted-foreground">Outdated</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <span className="text-muted-foreground">Insecure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-enterprise"></div>
              <span className="text-muted-foreground">Enterprise</span>
            </div>
          </div>
        </div>
        <Select value={securityFilter} onValueChange={setSecurityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by security" />
          </SelectTrigger>
          <SelectContent style={{ zIndex: 1000 }} position="popper">
            <SelectItem value="all">All Security Types</SelectItem>
            <SelectItem value="secure">Secure (WPA2/WPA3)</SelectItem>
            <SelectItem value="warning">Outdated (WPA)</SelectItem>
            <SelectItem value="danger">Insecure (Open/WEP)</SelectItem>
            <SelectItem value="enterprise">Enterprise (802.1X)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(70vh-70px)] w-full">
          <MapContainer
            center={filteredNetworks.length > 0 ? [filteredNetworks[0].CurrentLatitude, filteredNetworks[0].CurrentLongitude] : [0, 0]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizeHandler />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapBounds networks={filteredNetworks} />
            
            <MarkerClusterGroup chunkedLoading>
              {filteredNetworks.map((network, index) => {
                const securityType = determineSecurityType(network.AuthMode);
                const securityDetails = getDetailedSecurity(network.AuthMode);
                const manufacturer = getManufacturer(network.MAC);
                return (
                  <Marker
                    key={`${network.MAC}-${index}`}
                    position={[network.CurrentLatitude, network.CurrentLongitude]}
                    icon={createCustomIcon(securityType)}
                  >
                    <Popup>
                      <div className="min-w-64">
                        <div className="font-bold text-lg mb-3">
                          {network.SSID || 'Hidden Network'}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-muted-foreground">MAC:</span>
                              <div className="font-mono text-xs">{network.MAC}</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Manufacturer:</span>
                              <div>{manufacturer}</div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-muted-foreground">Security:</span>
                              <Badge variant={getSecurityBadgeVariant(securityType)}>
                                {getSecurityLabel(securityType)}
                              </Badge>
                            </div>
                            <div className="text-xs space-y-1">
                              <div><span className="font-medium">Protocol:</span> {securityDetails.protocol}</div>
                              <div><span className="font-medium">Encryption:</span> {securityDetails.encryption}</div>
                              {securityDetails.details && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Details:</span> {securityDetails.details}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border-t pt-2 grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-muted-foreground">Channel:</span>
                              <div>{network.Channel}</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">RSSI:</span>
                              <div className={
                                network.RSSI >= -50 ? 'text-green-600 font-medium' :
                                network.RSSI >= -70 ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'
                              }>
                                {network.RSSI} dBm
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-2">
                            <div className="text-xs text-muted-foreground">
                              <div><span className="font-medium">First Seen:</span> {network.FirstSeen}</div>
                              <div><span className="font-medium">Location:</span> {network.CurrentLatitude.toFixed(6)}, {network.CurrentLongitude.toFixed(6)}</div>
                              {network.AltitudeMeters > 0 && (
                                <div><span className="font-medium">Altitude:</span> {network.AltitudeMeters.toFixed(1)}m</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WiFiMap;
