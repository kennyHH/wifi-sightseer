import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV } from '@/utils/csvParser';
import { ParsedData } from '@/types/wifi';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed, isLoading, setIsLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setError(null);
    setIsLoading(true);

    try {
      const text = await file.text();
      const parsedData = await parseCSV(text);
      
      if (parsedData.networks.length === 0) {
        throw new Error('No valid WiFi networks found in the CSV file. Please check the format and ensure it contains location data.');
      }
      
      onDataParsed(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [onDataParsed, setIsLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center space-y-4 cursor-pointer
              ${isDragActive ? 'text-primary' : 'text-muted-foreground'}
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm">Processing CSV file...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12" />
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop the CSV file here' : 'Upload Kismet CSV File'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop your wardriving CSV file, or click to browse
                  </p>
                </div>
                <Button variant="outline" disabled={isLoading}>
                  Select File
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {fileName && !error && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Successfully loaded: {fileName}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Expected CSV Format:</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your CSV file should contain the following columns (header row required):
          </p>
          <div className="bg-background p-3 rounded border font-mono text-xs overflow-x-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">MAC</div>
            <div>BSSID of access point</div>

            <div className="font-medium text-foreground">SSID</div>
            <div>Network name (can be empty)</div>

            <div className="font-medium text-foreground">AuthMode</div>
            <div>Security protocols</div>

            <div className="font-medium text-foreground">FirstSeen</div>
            <div>First detection timestamp</div>

            <div className="font-medium text-foreground">Channel</div>
            <div>WiFi channel number</div>

            <div className="font-medium text-foreground">RSSI</div>
            <div>Signal strength (dBm)</div>

            <div className="font-medium text-foreground">CurrentLatitude</div>
            <div>GPS latitude coordinate</div>

            <div className="font-medium text-foreground">CurrentLongitude</div>
            <div>GPS longitude coordinate</div>

            <div className="font-medium text-foreground">AltitudeMeters</div>
            <div>Altitude in meters</div>

            <div className="font-medium text-foreground">AccuracyMeters</div>
            <div>GPS accuracy in meters</div>

            <div className="font-medium text-foreground">Type</div>
            <div>Network type identifier</div>
          </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All data processing is done locally in your browser. Your file is never uploaded to any server.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;