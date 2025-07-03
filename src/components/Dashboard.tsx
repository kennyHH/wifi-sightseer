import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParsedData } from '@/types/wifi';
import { getDetailedSecurity } from '@/utils/csvParser';
import { Shield, ShieldAlert, ShieldCheck, Building2, Wifi, Signal, Radio, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

interface DashboardProps {
  data: ParsedData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Security distribution chart
  const securityChartData = {
    labels: ['Secure', 'Outdated', 'Insecure', 'Enterprise'],
    datasets: [
      {
        data: [
          data.securityDistribution.secure,
          data.securityDistribution.warning,
          data.securityDistribution.danger,
          data.securityDistribution.enterprise
        ],
        backgroundColor: [
          'hsl(142, 76%, 36%)',  // secure
          'hsl(43, 96%, 56%)',   // warning
          'hsl(0, 84%, 60%)',    // danger
          'hsl(217, 91%, 60%)'   // enterprise
        ],
        borderColor: [
          'hsl(142, 76%, 36%)',  // secure
          'hsl(43, 96%, 56%)',   // warning
          'hsl(0, 84%, 60%)',    // danger
          'hsl(217, 91%, 60%)'   // enterprise
        ],
        borderWidth: 2,
      },
    ],
  };

  // Channel distribution chart
  const channels = Object.keys(data.channelDistribution).map(Number).sort((a, b) => a - b);
  const channelChartData = {
    labels: channels.map(ch => `Ch ${ch}`),
    datasets: [
      {
        label: 'Networks',
        data: channels.map(ch => data.channelDistribution[ch]),
        backgroundColor: 'hsl(142, 76%, 36%)',
        borderColor: 'hsl(142, 76%, 36%)',
        borderWidth: 1,
      },
    ],
  };

  // Manufacturer distribution (top 10)
  const manufacturerEntries = Object.entries(data.manufacturerDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const manufacturerChartData = {
    labels: manufacturerEntries.map(([name]) => name),
    datasets: [
      {
        label: 'Networks',
        data: manufacturerEntries.map(([,count]) => count),
        backgroundColor: 'hsl(217, 91%, 60%)',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
      },
    ],
  };

  // Company distribution (top 10)
  const companyEntries = Object.entries(data.companyDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const companyChartData = {
    labels: companyEntries.map(([name]) => name),
    datasets: [
      {
        label: 'Networks',
        data: companyEntries.map(([,count]) => count),
        backgroundColor: 'hsl(262, 80%, 58%)',
        borderColor: 'hsl(262, 80%, 58%)',
        borderWidth: 1,
      },
    ],
  };

  // RSSI distribution chart
  const rssiRanges = {
    'Excellent (-30 to -50 dBm)': 0,
    'Good (-50 to -60 dBm)': 0,
    'Fair (-60 to -70 dBm)': 0,
    'Poor (-70 to -80 dBm)': 0,
    'Very Poor (< -80 dBm)': 0
  };

  data.networks.forEach(network => {
    if (network.RSSI >= -50) rssiRanges['Excellent (-30 to -50 dBm)']++;
    else if (network.RSSI >= -60) rssiRanges['Good (-50 to -60 dBm)']++;
    else if (network.RSSI >= -70) rssiRanges['Fair (-60 to -70 dBm)']++;
    else if (network.RSSI >= -80) rssiRanges['Poor (-70 to -80 dBm)']++;
    else rssiRanges['Very Poor (< -80 dBm)']++;
  });

  const rssiChartData = {
    labels: Object.keys(rssiRanges),
    datasets: [
      {
        label: 'Networks',
        data: Object.values(rssiRanges),
        backgroundColor: [
          'hsl(142, 76%, 36%)',     // excellent
          'hsl(142, 76%, 46%)',     // good  
          'hsl(43, 96%, 56%)',      // fair
          'hsl(30, 90%, 50%)',      // poor
          'hsl(0, 84%, 60%)'        // very poor
        ],
        borderColor: [
          'hsl(142, 76%, 36%)',
          'hsl(142, 76%, 46%)',
          'hsl(43, 96%, 56%)',
          'hsl(30, 90%, 50%)',
          'hsl(0, 84%, 60%)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Detailed security protocol distribution
  const protocolCounts: { [key: string]: number } = {};
  data.networks.forEach(network => {
    const securityDetails = getDetailedSecurity(network.AuthMode);
    protocolCounts[securityDetails.protocol] = (protocolCounts[securityDetails.protocol] || 0) + 1;
  });

  const protocolChartData = {
    labels: Object.keys(protocolCounts),
    datasets: [
      {
        label: 'Networks',
        data: Object.values(protocolCounts),
        backgroundColor: Object.keys(protocolCounts).map(protocol => {
          if (protocol.includes('WPA3') || protocol.includes('WPA2')) return 'hsl(142, 76%, 36%)';
          if (protocol.includes('WPA-') || protocol === 'WPA') return 'hsl(43, 96%, 56%)';
          if (protocol.includes('Enterprise')) return 'hsl(217, 91%, 60%)';
          return 'hsl(0, 84%, 60%)';
        }),
        borderColor: Object.keys(protocolCounts).map(protocol => {
          if (protocol.includes('WPA3') || protocol.includes('WPA2')) return 'hsl(142, 76%, 36%)';
          if (protocol.includes('WPA-') || protocol === 'WPA') return 'hsl(43, 96%, 56%)';
          if (protocol.includes('Enterprise')) return 'hsl(217, 91%, 60%)';
          return 'hsl(0, 84%, 60%)';
        }),
        borderWidth: 1,
      },
    ],
  };

  // Time-based analysis (by hour of first seen)
  const hourCounts: { [key: number]: number } = {};
  for (let i = 0; i < 24; i++) hourCounts[i] = 0;

  data.networks.forEach(network => {
    const timeMatch = network.FirstSeen.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      if (hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    }
  });

  const timeChartData = {
    labels: Object.keys(hourCounts).map(h => `${h}:00`),
    datasets: [
      {
        label: 'Networks Discovered',
        data: Object.values(hourCounts),
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsl(142, 76%, 36%, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(0, 0%, 95%)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(215, 20.2%, 65.1%)',
        },
        grid: {
          color: 'hsl(220, 13%, 20%)',
        },
      },
      y: {
        ticks: {
          color: 'hsl(215, 20.2%, 65.1%)',
        },
        grid: {
          color: 'hsl(220, 13%, 20%)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'hsl(0, 0%, 95%)',
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Networks</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalNetworks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insecure Networks</CardTitle>
            <ShieldAlert className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{data.openNetworks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((data.openNetworks / data.totalNetworks) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RSSI</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.networks.reduce((sum, n) => sum + n.RSSI, 0) / data.networks.length).toFixed(1)} dBm
            </div>
            <p className="text-xs text-muted-foreground">
              Signal strength average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Channel</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Channel {data.mostCrowdedChannel}</div>
            <p className="text-xs text-muted-foreground">
              {data.channelDistribution[data.mostCrowdedChannel]} networks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure</CardTitle>
            <ShieldCheck className="h-4 w-4 text-secure" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secure">{data.secureNetworks}</div>
            <Badge variant="default" className="bg-secure text-secure-foreground">
              WPA2/WPA3
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outdated</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{data.outdatedNetworks}</div>
            <Badge variant="secondary" className="bg-warning text-warning-foreground">
              WPA Only
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <Building2 className="h-4 w-4 text-enterprise" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-enterprise">{data.enterpriseNetworks}</div>
            <Badge variant="outline" className="border-enterprise text-enterprise">
              802.1X/EAP
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insecure</CardTitle>
            <ShieldAlert className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{data.openNetworks}</div>
            <Badge variant="destructive">
              Open/WEP
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie data={securityChartData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={channelChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal Strength Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={rssiChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={protocolChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Discovery Timeline</CardTitle>
            <p className="text-sm text-muted-foreground">Networks discovered by hour of day</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={timeChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Device Manufacturers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={manufacturerChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Companies by SSID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={companyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
