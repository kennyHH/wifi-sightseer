import Papa from 'papaparse';
import { WiFiNetwork, ParsedData } from '../types/wifi';

// OUI database for manufacturer lookup (expanded list)
const OUI_DATABASE: { [key: string]: string } = {
  '00:00:0C': 'Cisco', '00:01:42': 'Cisco', '00:01:43': 'Cisco', '00:01:63': 'Cisco', '00:01:64': 'Cisco', '00:01:96': 'Cisco', '00:01:97': 'Cisco', '00:02:16': 'Cisco', '00:02:17': 'Cisco', '00:02:4A': 'Cisco', '00:02:4B': 'Cisco', '00:02:7D': 'Cisco', '00:02:7E': 'Cisco', '00:02:B9': 'Cisco', '00:02:BA': 'Cisco', '00:03:6B': 'Cisco', '00:03:9F': 'Cisco', '00:03:A0': 'Cisco', '00:03:E3': 'Cisco', '00:03:E4': 'Cisco', '00:04:27': 'Cisco', '00:04:28': 'Cisco', '00:04:4D': 'Cisco', '00:04:4E': 'Cisco', '00:04:6D': 'Cisco', '00:04:6E': 'Cisco', '00:04:75': 'Cisco', '00:04:76': 'Cisco', '00:04:9A': 'Cisco', '00:04:9B': 'Cisco', '00:04:C0': 'Cisco', '00:04:C1': 'Cisco', '00:04:DD': 'Cisco', '00:04:DE': 'Cisco', '00:05:00': 'Cisco', '00:05:31': 'Cisco', '00:05:32': 'Cisco', '00:05:5E': 'Cisco', '00:05:5F': 'Cisco', '00:05:73': 'Cisco', '00:05:74': 'Cisco', '00:05:9A': 'Cisco', '00:05:9B': 'Cisco', '00:05:DC': 'Cisco', '00:05:DD': 'Cisco', '00:06:28': 'Cisco', '00:06:29': 'Cisco', '00:06:52': 'Cisco', '00:06:53': 'Cisco', '00:06:7C': 'Cisco', '00:06:8C': 'Cisco', '00:06:C1': 'Cisco', '00:06:D6': 'Cisco', '00:06:D7': 'Cisco', '00:07:0D': 'Cisco', '00:07:0E': 'Cisco', '00:07:4F': 'Cisco', '00:07:50': 'Cisco', '00:07:84': 'Cisco', '00:07:85': 'Cisco', '00:07:B3': 'Cisco', '00:07:B4': 'Cisco', '00:07:EB': 'Cisco', '00:07:EC': 'Cisco', '00:08:2F': 'Cisco', '00:08:30': 'Cisco', '00:08:31': 'Cisco', '00:08:32': 'Cisco', '00:08:7C': 'Cisco', '00:08:7D': 'Cisco', '00:08:A3': 'Cisco', '00:08:A4': 'Cisco', '00:08:C7': 'Cisco', '00:08:C8': 'Cisco', '00:08:E2': 'Cisco', '00:08:E3': 'Cisco', '00:09:11': 'Cisco', '00:09:12': 'Cisco', '00:09:43': 'Cisco', '00:09:44': 'Cisco', '00:09:7B': 'Cisco', '00:09:7C': 'Cisco', '00:09:B6': 'Cisco', '00:09:B7': 'Cisco', '00:09:E8': 'Cisco', '00:09:E9': 'Cisco', '00:0A:41': 'Cisco', '00:0A:42': 'Cisco', '00:0A:8A': 'Cisco', '00:0A:8B': 'Cisco', '00:0A:B7': 'Cisco', '00:0A:B8': 'Cisco', '00:0A:F3': 'Cisco', '00:0A:F4': 'Cisco', '00:0B:45': 'Cisco', '00:0B:46': 'Cisco', '00:0B:5F': 'Cisco', '00:0B:60': 'Cisco', '00:0B:85': 'Cisco', '00:0B:BE': 'Cisco', '00:0B:BF': 'Cisco', '00:0B:FC': 'Cisco', '00:0B:FD': 'Cisco', '00:0C:30': 'Cisco', '00:0C:31': 'Cisco', '00:0C:85': 'Cisco', '00:0C:86': 'Cisco', '00:0C:CE': 'Cisco', '00:0C:CF': 'Cisco', '00:0D:28': 'Cisco', '00:0D:29': 'Cisco', '00:0D:65': 'Cisco', '00:0D:66': 'Cisco', '00:0D:BC': 'Cisco', '00:0D:BD': 'Cisco', '00:0E:38': 'Cisco', '00:0E:39': 'Cisco', '00:0E:83': 'Cisco', '00:0E:84': 'Cisco', '00:0E:D6': 'Cisco', '00:0E:D7': 'Cisco', '00:0F:23': 'Cisco', '00:0F:24': 'Cisco', '00:0F:34': 'Cisco', '00:0F:35': 'Cisco', '00:0F:8F': 'Cisco', '00:0F:90': 'Cisco', '00:0F:F7': 'Cisco', '00:0F:F8': 'Cisco', '00:10:0D': 'Cisco', '00:10:14': 'Cisco', '00:10:29': 'Cisco', '00:10:2F': 'Cisco', '00:10:4F': 'Cisco', '00:10:79': 'Cisco', '00:10:83': 'Cisco', '00:10:A6': 'Cisco', '00:10:B5': 'Cisco', '00:10:F6': 'Cisco', '00:11:20': 'Cisco', '00:11:21': 'Cisco', '00:11:5C': 'Cisco', '00:11:5D': 'Cisco', '00:11:92': 'Cisco', '00:11:93': 'Cisco', '00:11:A5': 'Cisco', '00:11:A6': 'Cisco', '00:12:00': 'Cisco', '00:12:01': 'Cisco', '00:12:43': 'Cisco', '00:12:44': 'Cisco', '00:12:7F': 'Cisco', '00:12:80': 'Cisco', '00:12:DA': 'Cisco', '00:12:DB': 'Cisco', '00:13:19': 'Cisco', '00:13:1A': 'Cisco', '00:13:5F': 'Cisco', '00:13:60': 'Cisco', '00:13:7F': 'Cisco', '00:13:80': 'Cisco', '00:13:C3': 'Cisco', '00:13:C4': 'Cisco', '00:14:1B': 'Cisco', '00:14:1C': 'Cisco', '00:14:69': 'Cisco', '00:14:6A': 'Cisco', '00:14:A8': 'Cisco', '00:14:A9': 'Cisco', '00:14:F1': 'Cisco', '00:14:F2': 'Cisco', '00:15:2A': 'Cisco', '00:15:2B': 'Cisco', '00:15:62': 'Cisco', '00:15:63': 'Cisco', '00:15:99': 'Cisco', '00:15:9A': 'Cisco', '00:15:C6': 'Cisco', '00:15:C7': 'Cisco', '00:15:FA': 'Cisco', '00:15:FB': 'Cisco', '00:16:46': 'Cisco', '00:16:47': 'Cisco', '00:16:6C': 'Cisco', '00:16:6D': 'Cisco', '00:16:9C': 'Cisco', '00:16:9D': 'Cisco', '00:16:C7': 'Cisco', '00:16:C8': 'Cisco', '00:17:0E': 'Cisco', '00:17:0F': 'Cisco', '00:17:3A': 'Cisco', '00:17:3B': 'Cisco', '00:17:59': 'Cisco', '00:17:5A': 'Cisco', '00:17:94': 'Cisco', '00:17:95': 'Cisco', '00:17:E0': 'Cisco', '00:18:18': 'Cisco', '00:18:19': 'Cisco', '00:18:52': 'Cisco', '00:18:53': 'Cisco', '00:18:73': 'Cisco', '00:18:74': 'Cisco', '00:18:98': 'Cisco', '00:18:99': 'Cisco', '00:18:B9': 'Cisco', '00:18:BA': 'Cisco', '00:18:F9': 'Cisco', '00:18:FA': 'Cisco', '00:19:06': 'Cisco', '00:19:07': 'Cisco', '00:19:2F': 'Cisco', '00:19:30': 'Cisco', '00:19:55': 'Cisco', '00:19:56': 'Cisco', '00:19:80': 'Cisco', '00:19:81': 'Cisco', '00:19:A9': 'Cisco', '00:19:AA': 'Cisco', '00:19:E7': 'Cisco', '00:19:E8': 'Cisco', '00:1A:2F': 'Cisco', '00:1A:30': 'Cisco', '00:1A:6C': 'Cisco', '00:1A:6D': 'Cisco', '00:1A:A1': 'Cisco', '00:1A:A2': 'Cisco', '00:1A:E2': 'Cisco', '00:1A:E3': 'Cisco', '00:1B:0C': 'Cisco', '00:1B:0D': 'Cisco', '00:1B:2A': 'Cisco', '00:1B:2B': 'Cisco', '00:1B:53': 'Cisco', '00:1B:54': 'Cisco', '00:1B:8F': 'Cisco', '00:1B:90': 'Cisco', '00:1B:D4': 'Cisco', '00:1B:D5': 'Cisco', '00:1C:0E': 'Cisco', '00:1C:0F': 'Cisco', '00:1C:57': 'Cisco', '00:1C:58': 'Cisco', '00:1C:B1': 'Cisco', '00:1C:B2': 'Cisco', '00:1D:45': 'Cisco', '00:1D:46': 'Cisco', '00:1D:70': 'Cisco', '00:1D:71': 'Cisco', '00:1D:A1': 'Cisco', '00:1D:A2': 'Cisco', '00:1D:E5': 'Cisco', '00:1D:E6': 'Cisco', '00:1E:13': 'Cisco', '00:1E:14': 'Cisco', '00:1E:49': 'Cisco', '00:1E:4A': 'Cisco', '00:1E:79': 'Cisco', '00:1E:7A': 'Cisco', '00:1E:BD': 'Cisco', '00:1E:BE': 'Cisco', '00:1F:26': 'Cisco', '00:1F:27': 'Cisco', '00:1F:6C': 'Cisco', '00:1F:6D': 'Cisco', '00:1F:9D': 'Cisco', '00:1F:9E': 'Cisco', '00:1F:CA': 'Cisco', '00:1F:CB': 'Cisco', '00:21:1B': 'Cisco', '00:21:1C': 'Cisco', '00:21:55': 'Cisco', '00:21:56': 'Cisco', '00:21:88': 'Cisco', '00:21:89': 'Cisco', '00:21:A0': 'Cisco', '00:21:A1': 'Cisco', '00:22:0C': 'Cisco', '00:22:0D': 'Cisco', '00:22:35': 'Cisco', '00:22:36': 'Cisco', '00:22:55': 'Cisco', '00:22:56': 'Cisco', '00:22:75': 'Cisco', '00:22:83': 'Cisco', '00:22:84': 'Cisco', '00:22:90': 'Cisco', '00:22:91': 'Cisco', '00:22:BD': 'Cisco', '00:22:BE': 'Cisco', '00:22:CE': 'Cisco', '00:22:CF': 'Cisco', '00:23:04': 'Cisco', '00:23:05': 'Cisco', '00:23:33': 'Cisco', '00:23:34': 'Cisco', '00:23:5D': 'Cisco', '00:23:5E': 'Cisco', '00:23:8F': 'Cisco', '00:23:90': 'Cisco', '00:23:AE': 'Cisco', '00:23:AF': 'Cisco', '00:23:BE': 'Cisco', '00:23:BF': 'Cisco', '00:23:EA': 'Cisco', '00:23:EB': 'Cisco', '00:24:13': 'Cisco', '00:24:14': 'Cisco', '00:24:37': 'Cisco', '00:24:38': 'Cisco', '00:24:50': 'Cisco', '00:24:51': 'Cisco', '00:24:73': 'Cisco', '00:24:8C': 'Cisco', '00:24:97': 'Cisco', '00:24:98': 'Cisco', '00:24:C3': 'Cisco', '00:24:C4': 'Cisco', '00:24:F9': 'Cisco', '00:24:FA': 'Cisco', '00:25:45': 'Cisco', '00:25:46': 'Cisco', '00:25:83': 'Cisco', '00:25:84': 'Cisco', '00:25:B4': 'Cisco', '00:25:B5': 'Cisco', '00:26:0A': 'Cisco', '00:26:0B': 'Cisco', '00:26:51': 'Cisco', '00:26:52': 'Cisco', '00:26:98': 'Cisco', '00:26:99': 'Cisco', '00:26:CB': 'Cisco', '00:26:CC': 'Cisco', '00:27:0C': 'Cisco', '00:27:0D': 'Cisco', '00:27:20': 'Cisco', '00:27:21': 'Cisco', '00:27:90': 'Cisco', '00:27:91': 'Cisco', '00:27:E3': 'Cisco', '00:27:E4': 'Cisco', '00:28:18': 'Cisco', '00:28:19': 'Cisco', '00:28:31': 'Cisco', '00:28:32': 'Cisco', '00:28:5A': 'Cisco', '00:28:5B': 'Cisco', '00:28:7F': 'Cisco', '00:28:80': 'Cisco', '00:28:A3': 'Cisco', '00:28:A4': 'Cisco', '00:28:C7': 'Cisco', '00:28:C8': 'Cisco', '00:28:E1': 'Cisco', '00:28:E2': 'Cisco', '00:29:05': 'Cisco', '00:29:06': 'Cisco', '00:29:20': 'Cisco', '00:29:21': 'Cisco', '00:29:39': 'Cisco', '00:29:3A': 'Cisco', '00:29:54': 'Cisco', '00:29:55': 'Cisco', '00:29:6D': 'Cisco', '00:29:6E': 'Cisco', '00:29:88': 'Cisco', '00:29:89': 'Cisco', '00:29:A1': 'Cisco', '00:29:A2': 'Cisco', '00:29:B9': 'Cisco', '00:29:BA': 'Cisco', '00:29:D3': 'Cisco', '00:29:D4': 'Cisco', '00:29:EC': 'Cisco', '00:29:ED': 'Cisco', '00:2A:06': 'Cisco', '00:2A:07': 'Cisco', '00:2A:1F': 'Cisco', '00:2A:20': 'Cisco', '00:2A:38': 'Cisco', '00:2A:39': 'Cisco', '00:2A:52': 'Cisco', '00:2A:53': 'Cisco', '00:2A:6B': 'Cisco', '00:2A:6C': 'Cisco', '00:2A:85': 'Cisco', '00:2A:86': 'Cisco', '00:2A:9E': 'Cisco', '00:2A:9F': 'Cisco', '00:2A:B7': 'Cisco', '00:2A:B8': 'Cisco', '00:2A:D1': 'Cisco', '00:2A:D2': 'Cisco', '00:2A:EA': 'Cisco', '00:2A:EB': 'Cisco', '00:2B:04': 'Cisco', '00:2B:05': 'Cisco', '00:2B:1D': 'Cisco', '00:2B:1E': 'Cisco', '00:2B:37': 'Cisco', '00:2B:38': 'Cisco', '00:2B:50': 'Cisco', '00:2B:51': 'Cisco', '00:2B:6A': 'Cisco', '00:2B:6B': 'Cisco', '00:2B:83': 'Cisco', '00:2B:84': 'Cisco', '00:2B:9C': 'Cisco', '00:2B:9D': 'Cisco', '00:2B:B6': 'Cisco', '00:2B:B7': 'Cisco', '00:2B:CF': 'Cisco', '00:2B:D0': 'Cisco', '00:2B:E9': 'Cisco', '00:2B:EA': 'Cisco', '00:2C:02': 'Cisco', '00:2C:03': 'Cisco', '00:2C:1C': 'Cisco', '00:2C:1D': 'Cisco', '00:2C:35': 'Cisco', '00:2C:36': 'Cisco', '00:2C:4F': 'Cisco', '00:2C:50': 'Cisco', '00:2C:68': 'Cisco', '00:2C:69': 'Cisco', '00:2C:82': 'Cisco', '00:2C:83': 'Cisco', '00:2C:9B': 'Cisco', '00:2C:9C': 'Cisco', '00:2C:B5': 'Cisco', '00:2C:B6': 'Cisco', '00:2C:CE': 'Cisco', '00:2C:CF': 'Cisco', '00:2C:E8': 'Cisco', '00:2C:E9': 'Cisco', '00:2D:01': 'Cisco', '00:2D:02': 'Cisco', '00:2D:1B': 'Cisco', '00:2D:1C': 'Cisco', '00:2D:34': 'Cisco', '00:2D:35': 'Cisco', '00:2D:4E': 'Cisco', '00:2D:4F': 'Cisco', '00:2D:67': 'Cisco', '00:2D:68': 'Cisco', '00:2D:81': 'Cisco', '00:2D:82': 'Cisco', '00:2D:9A': 'Cisco', '00:2D:9B': 'Cisco', '00:2D:B4': 'Cisco', '00:2D:B5': 'Cisco', '00:2D:CD': 'Cisco', '00:2D:CE': 'Cisco', '00:2D:E7': 'Cisco', '00:2D:E8': 'Cisco', '00:2E:00': 'Cisco', '00:2E:01': 'Cisco', '00:2E:1A': 'Cisco', '00:2E:1B': 'Cisco', '00:2E:33': 'Cisco', '00:2E:34': 'Cisco', '00:2E:4D': 'Cisco', '00:2E:4E': 'Cisco', '00:2E:66': 'Cisco', '00:2E:67': 'Cisco', '00:2E:80': 'Cisco', '00:2E:81': 'Cisco', '00:2E:99': 'Cisco', '00:2E:9A': 'Cisco', '00:2E:B3': 'Cisco', '00:2E:B4': 'Cisco', '00:2E:CC': 'Cisco', '00:2E:CD': 'Cisco', '00:2E:E5': 'Cisco', '00:2E:E6': 'Cisco', '00:2F:00': 'Cisco', '00:2F:01': 'Cisco', '00:2F:19': 'Cisco', '00:2F:1A': 'Cisco', '00:2F:33': 'Cisco', '00:2F:34': 'Cisco', '00:2F:4C': 'Cisco', '00:2F:4D': 'Cisco', '00:2F:66': 'Cisco', '00:2F:67': 'Cisco', '00:2F:7F': 'Cisco', '00:2F:80': 'Cisco', '00:2F:99': 'Cisco', '00:2F:9A': 'Cisco', '00:2F:B2': 'Cisco', '00:2F:B3': 'Cisco', '00:2F:CB': 'Cisco', '00:2F:CC': 'Cisco', '00:2F:E5': 'Cisco', '00:2F:E6': 'Cisco', '00:30:1E': 'Cisco', '00:30:40': 'Cisco', '00:30:65': 'Cisco', '00:30:71': 'Cisco', '00:30:78': 'Cisco', '00:30:80': 'Cisco', '00:30:94': 'Cisco', '00:30:96': 'Cisco', '00:30:A3': 'Cisco', '00:30:B6': 'Cisco', '00:30:F2': 'Cisco', '00:3A:7D': 'Cisco', '00:3A:98': 'Cisco', '00:3A:99': 'Cisco', '00:3A:9A': 'Cisco', '00:40:96': 'Cisco', '00:50:0F': 'Cisco', '00:50:14': 'Cisco', '00:50:2A': 'Cisco', '00:50:50': 'Cisco', '00:50:53': 'Cisco', '00:50:54': 'Cisco', '00:50:73': 'Cisco', '00:50:80': 'Cisco', '00:50:A2': 'Cisco', '00:50:BD': 'Cisco', '00:50:E2': 'Cisco', '00:50:F0': 'Cisco', '00:60:09': 'Cisco', '00:60:2F': 'Cisco', '00:60:3E': 'Cisco', '00:60:47': 'Cisco', '00:60:5C': 'Cisco', '00:60:70': 'Cisco', '00:60:83': 'Cisco', '00:90:1A': 'Cisco', '00:90:21': 'Cisco', '00:90:2B': 'Cisco', '00:90:5F': 'Cisco', '00:90:6D': 'Cisco', '00:90:86': 'Cisco', '00:90:92': 'Cisco', '00:90:A4': 'Cisco', '00:90:BF': 'Cisco', '00:90:D9': 'Cisco', '00:90:F2': 'Cisco', '00:A0:B0': 'Cisco', '00:A0:C5': 'Cisco', '00:B0:64': 'Cisco', '00:B0:C2': 'Cisco', '00:D0:06': 'Cisco', '00:D0:58': 'Cisco', '00:D0:79': 'Cisco', '00:D0:97': 'Cisco', '00:D0:BB': 'Cisco', '00:D0:BC': 'Cisco', '00:D0:D3': 'Cisco', '00:E0:14': 'Cisco', '00:E0:1E': 'Cisco', '00:E0:A3': 'Cisco', '00:E0:B0': 'Cisco', '00:E0:FE': 'Cisco', '01:00:5E': 'Cisco', '0C:F5:A4': 'Cisco', '10:05:CA': 'Cisco', '10:F3:11': 'Cisco', '14:10:9F': 'Cisco', '14:F6:5A': 'Cisco', '18:33:9D': 'Cisco', '18:80:90': 'Cisco', '18:9C:5D': 'Cisco', '1C:6A:7A': 'Cisco', '1C:E6:C7': 'Cisco', '20:37:06': 'Cisco', '20:4C:9E': 'Cisco', '24:B6:FD': 'Cisco', '28:34:A2': 'Cisco', '28:6F:7F': 'Cisco', '2C:3F:38': 'Cisco', '2C:54:2D': 'Cisco', '2C:86:D2': 'Cisco', '34:12:98': 'Cisco', '34:A8:4E': 'Cisco', '38:1C:1A': 'Cisco', '38:20:56': 'Cisco', '38:94:96': 'Cisco', '3C:CE:73': 'Cisco', '40:55:39': 'Cisco', '40:A6:D9': 'Cisco', '44:D3:CA': 'Cisco', '48:78:5E': 'Cisco', '4C:00:82': 'Cisco', '4C:4E:35': 'Cisco', '50:06:04': 'Cisco', '50:1C:B0': 'Cisco', '50:3D:E5': 'Cisco', '50:87:89': 'Cisco', '54:4A:16': 'Cisco', '54:A2:74': 'Cisco', '58:8D:09': 'Cisco', '58:97:BD': 'Cisco', '58:BC:2A': 'Cisco', '5C:50:15': 'Cisco', '5C:A4:8A': 'Cisco', '5C:F8:A1': 'Cisco', '60:73:5C': 'Cisco', '64:00:F1': 'Cisco', '64:12:25': 'Cisco', '64:9E:F3': 'Cisco', '64:A0:E7': 'Cisco', '64:D8:14': 'Cisco', '68:7D:5A': 'Cisco', '68:86:A7': 'Cisco', '68:99:CD': 'Cisco', '68:B7:49': 'Cisco', '6C:20:56': 'Cisco', '6C:41:6A': 'Cisco', '6C:5E:7A': 'Cisco', '6C:9C:ED': 'Cisco', '6C:FA:A7': 'Cisco', '70:1F:48': 'Cisco', '70:6B:B9': 'Cisco', '70:79:B3': 'Cisco', '70:CA:9B': 'Cisco', '74:A2:E6': 'Cisco', '78:02:F8': 'Cisco', '78:BA:F9': 'Cisco', '7C:0E:CE': 'Cisco', '7C:69:F6': 'Cisco', '7C:AD:74': 'Cisco', '80:E0:1D': 'Cisco', '84:3D:C6': 'Cisco', '84:78:8B': 'Cisco', '84:B8:02': 'Cisco', '88:43:E1': 'Cisco', '88:5A:92': 'Cisco', '88:75:56': 'Cisco', '8C:60:4F': 'Cisco', '90:1A:E6': 'Cisco', '90:7M:A6': 'Cisco', '90:B2:1F': 'Cisco', '9C:57:AD': 'Cisco', 'A0:23:9F': 'Cisco', 'A0:55:4F': 'Cisco', 'A0:B4:A5': 'Cisco', 'A0:EC:F9': 'Cisco', 'A4:0C:C3': 'Cisco', 'A4:4C:11': 'Cisco', 'A4:56:30': 'Cisco', 'A4:93:4C': 'Cisco', 'AC:7A:4D': 'Cisco', 'B0:00:B4': 'Cisco', 'B0:7D:4A': 'Cisco', 'B0:AA:77': 'Cisco', 'B4:A4:E3': 'Cisco', 'B4:DE:31': 'Cisco', 'B8:38:61': 'Cisco', 'B8:63:4F': 'Cisco', 'B8:B8:1E': 'Cisco', 'BC:16:F5': 'Cisco', 'BC:67:1C': 'Cisco', 'C0:25:5C': 'Cisco', 'C0:62:6B': 'Cisco', 'C0:7B:BC': 'Cisco', 'C0:8C:60': 'Cisco', 'C4:64:13': 'Cisco', 'C4:71:FE': 'Cisco', 'C4:7D:4F': 'Cisco', 'C8:4C:75': 'Cisco', 'C8:9C:1D': 'Cisco', 'C8:F9:F9': 'Cisco', 'CC:16:7E': 'Cisco', 'CC:46:D6': 'Cisco', 'CC:D5:39': 'Cisco', 'D0:57:4C': 'Cisco', 'D0:C2:82': 'Cisco', 'D0:D0:FD': 'Cisco', 'D4:6D:50': 'Cisco', 'D4:8C:B5': 'Cisco', 'D8:24:BD': 'Cisco', 'D8:B1:90': 'Cisco', 'DC:A5:F4': 'Cisco', 'E0:5F:B9': 'Cisco', 'E4:C7:22': 'Cisco', 'E8:04:62': 'Cisco', 'E8:B7:48': 'Cisco', 'EC:E1:A9': 'Cisco', 'F0:29:29': 'Cisco', 'F0:7F:06': 'Cisco', 'F4:4E:05': 'Cisco', 'F4:5F:D4': 'Cisco', 'F8:72:EA': 'Cisco', 'F8:A9:D0': 'Cisco', 'FC:5B:39': 'Cisco', 'FC:99:47': 'Cisco',
  '00:06:25': 'Linksys', '00:0C:41': 'Linksys', '00:12:17': 'Linksys', '00:13:10': 'Linksys', '00:14:BF': 'Linksys', '00:18:F8': 'Linksys', '00:1A:70': 'Linksys', '00:1C:10': 'Linksys', '00:1D:7E': 'Linksys', '00:25:9C': 'Linksys', '00:90:A9': 'Linksys', '08:86:3B': 'Linksys', '14:91:82': 'Linksys', '20:AA:4B': 'Linksys', '30:23:03': 'Linksys', '58:6D:8F': 'Linksys', '68:74:2D': 'Linksys', 'C0:56:27': 'Linksys',
  '00:09:5B': 'Netgear', '00:14:6C': 'Netgear', '00:18:4D': 'Netgear', '00:1E:2A': 'Netgear', '00:22:3F': 'Netgear', '00:26:F2': 'Netgear', '08:02:8E': 'Netgear', '08:BD:43': 'Netgear', '10:0D:7F': 'Netgear', '20:E5:2A': 'Netgear', '28:C6:8E': 'Netgear', '30:46:9A': 'Netgear', '40:5D:82': 'Netgear', '44:94:FC': 'Netgear', '60:0F:9F': 'Netgear', '74:44:01': 'Netgear', '74:A5:28': 'Netgear', '84:1B:5E': 'Netgear', '9C:3D:CF': 'Netgear', 'A0:04:60': 'Netgear', 'A0:21:B7': 'Netgear', 'A0:40:A0': 'Netgear', 'A4:2B:8C': 'Netgear', 'B0:39:56': 'Netgear', 'B0:7F:B9': 'Netgear', 'C0:3F:0E': 'Netgear', 'C4:04:15': 'Netgear', 'C4:3D:C7': 'Netgear', 'CC:40:D0': 'Netgear', 'E8:FC:AF': 'Netgear',
  '00:07:E9': 'Intel', '00:12:F0': 'Intel', '00:13:02': 'Intel', '00:13:E8': 'Intel', '00:15:00': 'Intel', '00:16:76': 'Intel', '00:18:DE': 'Intel', '00:1B:77': 'Intel', '00:1C:C0': 'Intel', '00:1E:65': 'Intel', '00:21:5C': 'Intel', '00:22:FA': 'Intel', '00:24:D7': 'Intel', '00:27:10': 'Intel', '08:11:96': 'Intel', '10:86:89': 'Intel', '34:13:E8': 'Intel', '3C:FD:FE': 'Intel', '5C:51:88': 'Intel', '5C:87:9C': 'Intel', '60:1D:91': 'Intel', '60:6C:66': 'Intel', '7C:B0:C2': 'Intel', '80:19:34': 'Intel', '80:9B:20': 'Intel', '90:E2:BA': 'Intel', '98:4F:EE': 'Intel', 'A0:88:B4': 'Intel', 'A4:34:D9': 'Intel', 'AC:FD:93': 'Intel', 'B4:6D:83': 'Intel', 'BC:83:A7': 'Intel', 'C8:F7:50': 'Intel', 'D4:81:D7': 'Intel', 'E4:02:9B': 'Intel', 'F8:E4:FB': 'Intel',
  '00:03:7F': 'Atheros', '00:13:74': 'Atheros', '00:15:6D': 'Atheros', '00:16:CF': 'Atheros', '00:17:C5': 'Atheros', '00:18:84': 'Atheros', '00:19:66': 'Atheros', '00:1A:A9': 'Atheros', '00:1B:B1': 'Atheros', '00:1C:F0': 'Atheros', '00:1D:0F': 'Atheros', '00:1F:3A': 'Atheros', '00:21:7C': 'Atheros', '00:22:43': 'Atheros', '00:23:4D': 'Atheros', '00:24:2C': 'Atheros', '00:26:5C': 'Atheros', '00:A0:C6': 'Atheros', '04:F0:21': 'Atheros', '10:2F:6B': 'Atheros', '14:B9:68': 'Atheros', '20:76:93': 'Atheros', '40:B3:95': 'Atheros', '64:D4:DA': 'Atheros', '74:DE:2B': 'Atheros', '78:A3:E4': 'Atheros', '80:06:8C': 'Atheros', '84:C9:B2': 'Atheros', '94:FE:F4': 'Atheros', 'A0:21:97': 'Atheros', 'B4:B3:62': 'Atheros', 'C0:A0:BB': 'Atheros', 'C4:17:FE': 'Atheros', 'D8:FE:E3': 'Atheros', 'E8:DE:27': 'Atheros', 'F0:9F:C2': 'Atheros',
  '00:0A:EB': 'Apple', '00:16:CB': 'Apple', '00:17:F2': 'Apple', '00:19:E3': 'Apple', '00:1B:63': 'Apple', '00:1D:4F': 'Apple', '00:1E:52': 'Apple', '00:1F:5B': 'Apple', '00:1F:F3': 'Apple', '00:21:E9': 'Apple', '00:22:41': 'Apple', '00:23:12': 'Apple', '00:23:32': 'Apple', '00:23:6C': 'Apple', '00:23:DF': 'Apple', '00:24:36': 'Apple', '00:25:00': 'Apple', '00:25:4B': 'Apple', '00:25:BC': 'Apple', '00:26:08': 'Apple', '00:26:4A': 'Apple', '00:26:B0': 'Apple', '00:26:BB': 'Apple', '00:A0:40': 'Apple', '04:0C:CE': 'Apple', '04:1E:64': 'Apple', '08:74:02': 'Apple', '0C:74:C2': 'Apple', '10:9A:DD': 'Apple', '28:6A:BA': 'Apple', '28:E7:CF': 'Apple', '34:36:3B': 'Apple', '38:4F:F0': 'Apple', '3C:07:54': 'Apple', '40:3C:FC': 'Apple', '40:A6:77': 'Apple', '44:D8:84': 'Apple', '50:EA:D6': 'Apple', '54:26:96': 'Apple', '58:B0:35': 'Apple', '60:C5:47': 'Apple', '60:FA:CD': 'Apple', '64:A3:CB': 'Apple', '68:5B:35': 'Apple', '68:A8:6D': 'Apple', '70:3E:AC': 'Apple', '70:56:81': 'Apple', '7C:11:BE': 'Apple', '7C:C3:A1': 'Apple', '7C:F0:5F': 'Apple', '88:1F:A1': 'Apple', '88:C6:63': 'Apple', '8C:2D:AA': 'Apple', '98:FE:94': 'Apple', 'A8:86:DD': 'Apple', 'AC:BC:32': 'Apple', 'B8:17:C2': 'Apple', 'B8:8D:12': 'Apple', 'B8:E8:56': 'Apple', 'B8:F6:B1': 'Apple', 'C0:CE:CD': 'Apple', 'C8:1E:E7': 'Apple', 'CC:20:E8': 'Apple', 'F0:B4:79': 'Apple', 'F4:37:B7': 'Apple',
  '00:1A:11': 'Google', '3C:5A:B4': 'Google', '94:EB:2C': 'Google', 'A4:77:33': 'Google', 'F8:0F:F9': 'Google',
  '00:15:5D': 'Microsoft', '00:22:48': 'Microsoft', '00:50:F2': 'Microsoft', '30:59:B7': 'Microsoft', '60:45:BD': 'Microsoft', '7C:1E:52': 'Microsoft', 'C0:33:5E': 'Microsoft',
  '00:08:74': 'Dell', '00:11:43': 'Dell', '00:12:3F': 'Dell', '00:13:72': 'Dell', '00:14:22': 'Dell', '00:15:C5': 'Dell', '00:18:8B': 'Dell', '00:19:B9': 'Dell', '00:1A:A0': 'Dell', '00:1D:09': 'Dell', '00:1E:4F': 'Dell', '00:21:70': 'Dell', '00:21:9B': 'Dell', '00:22:19': 'Dell', '00:23:AE': 'Dell', '00:24:E8': 'Dell', '00:25:64': 'Dell', '00:26:B9': 'Dell', '18:03:73': 'Dell', '18:FB:7B': 'Dell', '20:47:47': 'Dell', '54:9F:13': 'Dell', '74:86:7A': 'Dell', '78:45:C4': 'Dell', '84:8F:69': 'Dell', 'B8:CA:3A': 'Dell', 'C8:1F:66': 'Dell', 'D0:43:19': 'Dell', 'D4:AE:52': 'Dell', 'E0:DB:55': 'Dell', 'F0:4D:A2': 'Dell',
  '14:CC:20': 'TP-Link', '30:B5:C2': 'TP-Link', '50:C7:BF': 'TP-Link', '64:66:B3': 'TP-Link', '70:4F:57': 'TP-Link', '8C:A6:DF': 'TP-Link', '90:F6:52': 'TP-Link', 'B0:4E:26': 'TP-Link', 'B8:F8:83': 'TP-Link', 'C0:4A:00': 'TP-Link', 'C4:6E:1F': 'TP-Link', 'CC:32:E5': 'TP-Link', 'E8:DE:27': 'TP-Link', 'F4:F2:6D': 'TP-Link',
  '00:17:9A': 'D-Link', '00:21:91': 'D-Link', '00:22:B0': 'D-Link', '00:24:01': 'D-Link', '00:26:5A': 'D-Link', '14:D6:4D': 'D-Link', '1C:7E:E5': 'D-Link', '28:10:7B': 'D-Link', '5C:D9:98': 'D-Link', '84:C9:B2': 'D-Link', '90:94:E4': 'D-Link', 'AC:F1:DF': 'D-Link', 'B8:A3:86': 'D-Link', 'C8:BE:19': 'D-Link', 'CC:B2:55': 'D-Link', 'FC:75:16': 'D-Link',
  '00:90:4B': 'ASUS', '08:60:6E': 'ASUS', '08:62:66': 'ASUS', '10:BF:48': 'ASUS', '14:D0:2D': 'ASUS', '18:31:BF': 'ASUS', '20:CF:30': 'ASUS', '2C:4D:54': 'ASUS', '30:5A:3A': 'ASUS', '38:2C:4A': 'ASUS', '40:16:7F': 'ASUS', '50:46:5D': 'ASUS', '54:04:A6': 'ASUS', '60:45:CB': 'ASUS', '70:4D:7B': 'ASUS', '74:D0:2B': 'ASUS', '78:24:AF': 'ASUS', '88:D7:F6': 'ASUS', '90:E6:BA': 'ASUS', 'A0:F3:C1': 'ASUS', 'BC:77:37': 'ASUS', 'BC:AE:C5': 'ASUS', 'C8:60:00': 'ASUS', 'D8:50:E6': 'ASUS', 'E0:3F:49': 'ASUS', 'F4:6D:04': 'ASUS',
  '00:0D:88': 'Broadcom', '00:10:18': 'Broadcom', '00:10:E7': 'Broadcom', '00:12:5A': 'Broadcom', '00:13:E0': 'Broadcom', '00:15:E9': 'Broadcom', '00:17:3F': 'Broadcom', '00:19:7D': 'Broadcom', '00:1B:9E': 'Broadcom', '00:1D:E1': 'Broadcom', '00:1F:E4': 'Broadcom', '00:21:45': 'Broadcom', '00:22:68': 'Broadcom', '00:23:76': 'Broadcom', '00:24:B2': 'Broadcom', '00:25:86': 'Broadcom', '00:26:4D': 'Broadcom', '00:A0:B8': 'Broadcom', '10:1C:0C': 'Broadcom', '14:A5:1A': 'Broadcom', '20:0C:C8': 'Broadcom', '44:33:4C': 'Broadcom', '48:D7:05': 'Broadcom', '5C:DA:D4': 'Broadcom', '60:A1:0A': 'Broadcom', '74:C6:3B': 'Broadcom', '80:08:30': 'Broadcom', '88:A6:C6': 'Broadcom', '90:4C:81': 'Broadcom', 'A0:D7:95': 'Broadcom', 'B0:89:00': 'Broadcom', 'B8:57:D8': 'Broadcom', 'C8:B3:73': 'Broadcom', 'D4:01:29': 'Broadcom', 'DC:0B:1A': 'Broadcom', 'E8:3E:B6': 'Broadcom', 'F0:B0:E7': 'Broadcom',
  '00:0C:E7': 'Samsung', '00:12:FB': 'Samsung', '00:15:B9': 'Samsung', '00:16:6F': 'Samsung', '00:17:D5': 'Samsung', '00:18:AF': 'Samsung', '00:1A:98': 'Samsung', '00:1B:92': 'Samsung', '00:1C:4B': 'Samsung', '00:1D:25': 'Samsung', '00:1E:6C': 'Samsung', '00:1F:CC': 'Samsung', '00:21:D1': 'Samsung', '00:22:5D': 'Samsung', '00:23:39': 'Samsung', '00:24:54': 'Samsung', '00:25:38': 'Samsung', '00:26:37': 'Samsung', '00:26:5F': 'Samsung', '08:37:3D': 'Samsung', '10:D5:42': 'Samsung', '18:1E:78': 'Samsung', '20:55:31': 'Samsung', '24:4B:03': 'Samsung', '28:3A:4D': 'Samsung', '2C:6F:C9': 'Samsung', '38:09:A4': 'Samsung', '3C:8B:F3': 'Samsung', '48:44:F7': 'Samsung', '50:A4:C8': 'Samsung', '54:88:0E': 'Samsung', '58:C3:8B': 'Samsung', '60:7A:48': 'Samsung', '60:D0:A9': 'Samsung', '6C:83:34': 'Samsung', '70:2A:D5': 'Samsung', '78:1F:DB': 'Samsung', '78:4B:87': 'Samsung', '78:A5:DD': 'Samsung', '80:18:44': 'Samsung', '84:26:2B': 'Samsung', '88:3D:D5': 'Samsung', '8C:1A:BF': 'Samsung', '90:18:7C': 'Samsung', '94:3B:B1': 'Samsung', '98:0D:2E': 'Samsung', '9C:02:98': 'Samsung', 'A0:75:91': 'Samsung', 'A8:7D:12': 'Samsung', 'AC:5F:3E': 'Samsung', 'B0:C5:59': 'Samsung', 'B4:07:F9': 'Samsung', 'BC:20:A4': 'Samsung', 'C0:11:73': 'Samsung', 'C4:57:6E': 'Samsung', 'C8:A8:23': 'Samsung', 'CC:F9:E8': 'Samsung', 'D0:60:8C': 'Samsung', 'D4:E8:B2': 'Samsung', 'D8:31:CF': 'Samsung', 'DC:1D:9F': 'Samsung', 'E0:9D:B8': 'Samsung', 'E4:B3:18': 'Samsung', 'E8:50:8B': 'Samsung', 'EC:1F:72': 'Samsung', 'F0:08:F1': 'Samsung', 'F0:24:75': 'Samsung', 'F4:7B:5E': 'Samsung', 'F8:04:2E': 'Samsung', 'FC:C7:34': 'Samsung',
  '00:0B:82': 'HUAWEI', '00:18:82': 'HUAWEI', '00:1E:10': 'HUAWEI', '00:22:A1': 'HUAWEI', '00:25:68': 'HUAWEI', '00:25:9E': 'HUAWEI', '00:46:4B': 'HUAWEI', '00:E0:FC': 'HUAWEI', '04:C0:6F': 'HUAWEI', '08:19:A6': 'HUAWEI', '08:4F:A9': 'HUAWEI', '0C:37:DC': 'HUAWEI', '10:47:80': 'HUAWEI', '18:C5:8A': 'HUAWEI', '20:0B:C7': 'HUAWEI', '20:F3:A3': 'HUAWEI', '24:69:A5': 'HUAWEI', '28:31:52': 'HUAWEI', '28:3C:E4': 'HUAWEI', '28:5F:DB': 'HUAWEI', '28:6E:D4': 'HUAWEI', '30:87:30': 'HUAWEI', '34:6D:C7': 'HUAWEI', '38:F8:B7': 'HUAWEI', '3C:DF:A9': 'HUAWEI', '40:4D:8E': 'HUAWEI', '40:CB:A8': 'HUAWEI', '44:55:B1': 'HUAWEI', '48:00:31': 'HUAWEI', '4C:1F:CC': 'HUAWEI', '4C:B1:6C': 'HUAWEI', '50:9F:27': 'HUAWEI', '54:89:98': 'HUAWEI', '54:A5:4B': 'HUAWEI', '58:1F:28': 'HUAWEI', '5C:4C:A9': 'HUAWEI', '5C:7D:5E': 'HUAWEI', '60:DE:44': 'HUAWEI', '64:16:F0': 'HUAWEI', '68:87:52': 'HUAWEI', '70:7B:E8': 'HUAWEI', '78:1D:BA': 'HUAWEI', '78:4A:E2': 'HUAWEI', '78:F5:FD': 'HUAWEI', '80:4A:14': 'HUAWEI', '80:B6:86': 'HUAWEI', '80:FB:06': 'HUAWEI', '84:A8:E4': 'HUAWEI', '88:53:D4': 'HUAWEI', '88:CE:FA': 'HUAWEI', '8C:34:FD': 'HUAWEI', '90:48:9A': 'HUAWEI', '90:67:18': 'HUAWEI', '94:7F:2A': 'HUAWEI', '9C:28:B1': 'HUAWEI', 'A0:93:47': 'HUAWEI', 'A4:99:47': 'HUAWEI', 'A8:55:45': 'HUAWEI', 'AC:E2:15': 'HUAWEI', 'B0:5B:67': 'HUAWEI', 'B4:15:13': 'HUAWEI', 'B8:BC:1A': 'HUAWEI', 'BC:3B:AF': 'HUAWEI', 'C0:70:09': 'HUAWEI', 'C8:0C:C8': 'HUAWEI', 'C8:51:95': 'HUAWEI', 'CC:A2:23': 'HUAWEI', 'D0:2D:B3': 'HUAWEI', 'D0:7A:B5': 'HUAWEI', 'D4:6A:A8': 'HUAWEI', 'D4:B1:10': 'HUAWEI', 'D8:49:0B': 'HUAWEI', 'DC:D2:FC': 'HUAWEI', 'E0:24:7F': 'HUAWEI', 'E0:97:96': 'HUAWEI', 'E4:68:A3': 'HUAWEI', 'E8:08:8B': 'HUAWEI', 'E8:CD:2D': 'HUAWEI', 'EC:23:3D': 'HUAWEI', 'F4:9F:F3': 'HUAWEI', 'F8:01:13': 'HUAWEI', 'F8:3D:FF': 'HUAWEI', 'F8:4A:BF': 'HUAWEI', 'FC:E3:3C': 'HUAWEI',
  '00:10:20': 'Realtek', '00:E0:4C': 'Realtek',
};""

// Well-known company SSIDs
const COMPANY_SSIDS: { [key: string]: string } = {
  'virgin': 'Virgin Media',
  'three': 'Three',
  'o2': 'O2',
  'bt': 'BT',
  'sky': 'Sky',
  'ee': 'EE',
  'vodafone': 'Vodafone',
  'xfinity': 'Comcast',
  'spectrum': 'Charter',
  'optimum': 'Altice',
  'cox': 'Cox',
  'linksys': 'Linksys',
  'netgear': 'Netgear',
  'd-link': 'D-Link',
  'asus': 'ASUS',
  't-mobile': 'T-Mobile',
  'att': 'AT&T',
  'verizon': 'Verizon',
  'google': 'Google',
  'starbucks': 'Starbucks',
};

export function getManufacturer(mac: string): string {
  const oui = mac.substring(0, 8).toUpperCase();
  return OUI_DATABASE[oui] || 'Unknown';
}

export function getCompanyFromSSID(ssid: string): string | null {
  const lowerSSID = ssid.toLowerCase();
  for (const key in COMPANY_SSIDS) {
    if (lowerSSID.includes(key)) {
      return COMPANY_SSIDS[key];
    }
  }
  return null;
}

export function determineSecurityType(authMode: string): 'secure' | 'warning' | 'danger' | 'enterprise' {
  const auth = authMode.toLowerCase();
  
  // Order-based check: Highest security first
  if (auth.includes('wpa3')) return 'secure';
  if (auth.includes('wpa2')) return 'secure';
  if (auth.includes('eap') || auth.includes('802.1x')) return 'enterprise';
  if (auth.includes('wpa')) return 'warning'; // WPA1 or mixed WPA/WPA2
  if (auth.includes('wep')) return 'danger';
  if (!auth || auth === '' || auth.includes('open') || auth === '[ess]') return 'danger';
  
  // Default for unknown but likely encrypted
  return 'warning';
}

export function getDetailedSecurity(authMode: string): {
  type: 'secure' | 'warning' | 'danger' | 'enterprise';
  protocol: string;
  encryption: string;
  details: string;
} {
  const auth = authMode.toLowerCase();
  
  // Enterprise detection
  if (auth.includes('eap') || auth.includes('802.1x')) {
    let protocol = 'Enterprise';
    if (auth.includes('wpa3')) protocol = 'WPA3-Enterprise';
    else if (auth.includes('wpa2')) protocol = 'WPA2-Enterprise';
    else if (auth.includes('wpa-')) protocol = 'WPA-Enterprise';
    
    return {
      type: 'enterprise',
      protocol,
      encryption: auth.includes('ccmp') ? 'AES-CCMP' : auth.includes('tkip') ? 'TKIP' : 'Unknown',
      details: authMode
    };
  }
  
  // WPA3 detection
  if (auth.includes('wpa3')) {
    return {
      type: 'secure',
      protocol: 'WPA3',
      encryption: auth.includes('ccmp') ? 'AES-CCMP' : 'SAE',
      details: authMode
    };
  }
  
  // WPA2 detection
  if (auth.includes('wpa2')) {
    return {
      type: 'secure',
      protocol: 'WPA2',
      encryption: auth.includes('ccmp') ? 'AES-CCMP' : auth.includes('tkip') ? 'TKIP' : 'Mixed',
      details: authMode
    };
  }
  
  // WPA1 only detection
  if (auth.includes('wpa-psk') && !auth.includes('wpa2')) {
    return {
      type: 'warning',
      protocol: 'WPA',
      encryption: auth.includes('tkip') ? 'TKIP' : auth.includes('ccmp') ? 'AES-CCMP' : 'Mixed',
      details: authMode
    };
  }
  
  // WEP detection
  if (auth.includes('wep')) {
    return {
      type: 'danger',
      protocol: 'WEP',
      encryption: 'WEP',
      details: authMode
    };
  }
  
  // Open network
  if (!auth || auth === '' || auth.includes('open') || auth === '[ess]') {
    return {
      type: 'danger',
      protocol: 'Open',
      encryption: 'None',
      details: 'No encryption'
    };
  }
  
  // Unknown
  return {
    type: 'warning',
    protocol: 'Unknown',
    encryption: 'Unknown',
    details: authMode
  };
}

export function parseCSV(csvContent: string): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const uniqueNetworks = new Map<string, WiFiNetwork>();

          results.data.forEach((row: any) => {
            const network: WiFiNetwork = {
              MAC: row.MAC || '',
              SSID: row.SSID || '',
              AuthMode: row.AuthMode || '',
              FirstSeen: row.FirstSeen || '',
              Channel: parseInt(row.Channel) || 0,
              RSSI: parseInt(row.RSSI) || 0,
              CurrentLatitude: parseFloat(row.CurrentLatitude) || 0,
              CurrentLongitude: parseFloat(row.CurrentLongitude) || 0,
              AltitudeMeters: parseFloat(row.AltitudeMeters) || 0,
              AccuracyMeters: parseInt(row.AccuracyMeters) || 0,
              Type: row.Type || '',
            };

            if (
              network.MAC &&
              !isNaN(network.CurrentLatitude) &&
              !isNaN(network.CurrentLongitude) &&
              network.CurrentLatitude !== 0 &&
              network.CurrentLongitude !== 0
            ) {
              const key = `${network.MAC}-${network.SSID}`;
              const existing = uniqueNetworks.get(key);

              // Keep the entry with the strongest signal (lowest RSSI is strongest)
              if (!existing || network.RSSI > existing.RSSI) {
                uniqueNetworks.set(key, network);
              }
            }
          });

          const networks: WiFiNetwork[] = Array.from(uniqueNetworks.values());

          // Calculate statistics
          const securityDistribution = {
            secure: 0,
            warning: 0,
            danger: 0,
            enterprise: 0
          };

          const channelDistribution: { [key: number]: number } = {};
          const ssidCounts: { [key: string]: number } = {};
          const manufacturerDistribution: { [key: string]: number } = {};
          const companyDistribution: { [key: string]: number } = {};

          networks.forEach((network) => {
            // Security distribution
            const secType = determineSecurityType(network.AuthMode);
            securityDistribution[secType]++;

            // Channel distribution
            if (network.Channel > 0) {
              channelDistribution[network.Channel] = (channelDistribution[network.Channel] || 0) + 1;
            }

            // SSID counts
            if (network.SSID && network.SSID.trim() !== '') {
              ssidCounts[network.SSID] = (ssidCounts[network.SSID] || 0) + 1;
            }

            // Manufacturer distribution
            const manufacturer = getManufacturer(network.MAC);
            manufacturerDistribution[manufacturer] = (manufacturerDistribution[manufacturer] || 0) + 1;

            // Company distribution
            const company = getCompanyFromSSID(network.SSID);
            if (company) {
              companyDistribution[company] = (companyDistribution[company] || 0) + 1;
            }
          });

          // Find most common SSID
          const mostCommonSSID = Object.entries(ssidCounts).reduce(
            (a, b) => (ssidCounts[a[0]] > ssidCounts[b[0]] ? a : b),
            ['Unknown', 0]
          )[0];

          // Find most crowded channel
          const mostCrowdedChannel = Object.entries(channelDistribution).reduce(
            (a, b) => (channelDistribution[parseInt(a[0])] > channelDistribution[parseInt(b[0])] ? a : b),
            ['0', 0]
          );

          const parsedData: ParsedData = {
            networks,
            totalNetworks: networks.length,
            openNetworks: securityDistribution.danger,
            secureNetworks: securityDistribution.secure,
            enterpriseNetworks: securityDistribution.enterprise,
            outdatedNetworks: securityDistribution.warning,
            mostCommonSSID,
            mostCrowdedChannel: parseInt(mostCrowdedChannel[0]),
            channelDistribution,
            securityDistribution,
            manufacturerDistribution,
            companyDistribution,
          };

          resolve(parsedData);
        } catch (error) {
          reject(new Error('Failed to parse CSV data: ' + error));
        }
      },
      error: (error) => {
        reject(new Error('CSV parsing error: ' + error.message));
      }
    });
  });
}

