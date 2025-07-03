import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import WiFiMap from '@/components/WiFiMap';
import Dashboard from '@/components/Dashboard';
import DataTable from '@/components/DataTable';
import { ParsedData } from '@/types/wifi';
import { Shield, MapPin, BarChart3, Table, Wifi } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">WiFi Wardriving Visualizer</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze and visualize WiFi network security data from Kismet wardriving sessions. 
            All processing is done locally in your browser for maximum privacy.
          </p>
        </div>

        {!parsedData ? (
          /* File Upload Section */
          <div className="max-w-2xl mx-auto">
            <FileUpload 
              onDataParsed={handleDataParsed} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        ) : (
          /* Main Dashboard */
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Data
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="flex items-center gap-2"
                onClick={() => setParsedData(null)}
              >
                <Wifi className="h-4 w-4" />
                New File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard data={parsedData} />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="show-hidden-networks"
                  checked={showHiddenNetworks}
                  onCheckedChange={setShowHiddenNetworks}
                />
                <Label htmlFor="show-hidden-networks">Show Hidden Networks</Label>
              </div>
              <WiFiMap networks={parsedData.networks.filter(network => showHiddenNetworks || network.SSID !== '')} />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <DataTable networks={parsedData.networks} />
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span>Privacy-First WiFi Analysis</span>
          </div>
          <p>
            Your data never leaves your device. All processing is performed locally in your browser.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
