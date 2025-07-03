import React, { useState, useMemo } from 'react';
import { WiFiNetwork } from '@/types/wifi';
import { determineSecurityType, getManufacturer, getDetailedSecurity } from '@/utils/csvParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowUpDown, Search } from 'lucide-react';

interface DataTableProps {
  networks: WiFiNetwork[];
}

type SortKey = keyof WiFiNetwork | 'manufacturer' | 'securityType';
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ networks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('SSID');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedNetworks = useMemo(() => {
    let filtered = networks.filter((network) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        network.SSID.toLowerCase().includes(searchLower) ||
        network.MAC.toLowerCase().includes(searchLower) ||
        network.AuthMode.toLowerCase().includes(searchLower) ||
        getManufacturer(network.MAC).toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortKey) {
        case 'manufacturer':
          aValue = getManufacturer(a.MAC);
          bValue = getManufacturer(b.MAC);
          break;
        case 'securityType':
          aValue = determineSecurityType(a.AuthMode);
          bValue = determineSecurityType(b.AuthMode);
          break;
        default:
          aValue = a[sortKey as keyof WiFiNetwork];
          bValue = b[sortKey as keyof WiFiNetwork];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [networks, searchTerm, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedNetworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNetworks = filteredAndSortedNetworks.slice(startIndex, startIndex + itemsPerPage);

  const SortButton: React.FC<{ column: SortKey; children: React.ReactNode }> = ({ column, children }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Data</CardTitle>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search networks, MAC addresses, or manufacturers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {paginatedNetworks.length} of {filteredAndSortedNetworks.length} networks
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton column="SSID">SSID</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="MAC">MAC Address</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="manufacturer">Manufacturer</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="securityType">Security</SortButton>
                </TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Encryption</TableHead>
                <TableHead>
                  <SortButton column="Channel">Channel</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="RSSI">RSSI</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="FirstSeen">First Seen</SortButton>
                </TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNetworks.map((network, index) => {
                const securityType = determineSecurityType(network.AuthMode);
                const securityDetails = getDetailedSecurity(network.AuthMode);
                const manufacturer = getManufacturer(network.MAC);
                
                return (
                  <TableRow key={`${network.MAC}-${index}`}>
                    <TableCell className="font-medium">
                      {network.SSID || <span className="text-muted-foreground italic">Hidden</span>}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{network.MAC}</TableCell>
                    <TableCell>{manufacturer}</TableCell>
                    <TableCell>
                      <Badge variant={getSecurityBadgeVariant(securityType)}>
                        {getSecurityLabel(securityType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{securityDetails.protocol}</TableCell>
                    <TableCell className="text-sm">{securityDetails.encryption}</TableCell>
                    <TableCell>{network.Channel}</TableCell>
                    <TableCell className={
                      network.RSSI >= -50 ? 'text-secure' :
                      network.RSSI >= -70 ? 'text-warning' : 'text-danger'
                    }>
                      {network.RSSI} dBm
                    </TableCell>
                    <TableCell className="text-sm">{network.FirstSeen}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {network.CurrentLatitude.toFixed(4)}, {network.CurrentLongitude.toFixed(4)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;