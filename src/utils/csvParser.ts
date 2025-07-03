import Papa from 'papaparse';
import { WiFiNetwork, ParsedData } from '../types/wifi';

// OUI database for manufacturer lookup (expanded list)
const OUI_DATABASE: { [key: string]: string } = {
  '00:00:0C': 'Cisco', '00:01:42': 'Cisco', '00:01:43': 'Cisco', '00:01:63': 'Cisco', '00:01:64': 'Cisco', '00:01:96': 'Cisco', '00:01:97': 'Cisco', '00:02:16': 'Cisco', '00:02:17': 'Cisco', '00:02:4A': 'Cisco', '00:02:4B': 'Cisco', '00:02:7D': 'Cisco', '00:02:7E': 'Cisco', '00:02:B9': 'Cisco', '00:02:BA': 'Cisco', '00:03:6B': 'Cisco', '00:03:9F': 'Cisco', '00:03:A0': 'Cisco', '00:03:E3': 'Cisco', '00:03:E4': 'Cisco', '00:04:27': 'Cisco', '00:04:28': 'Cisco', '00:04:4D': 'Cisco', '00:04:4E': 'Cisco', '00:04:6D': 'Cisco', '00:04:6E': 'Cisco', '00:04:75': 'Cisco', '00:04:76': 'Cisco', '00:04:9A': 'Cisco', '00:04:9B': 'Cisco', '00:04:C0': 'Cisco', '00:04:C1': 'Cisco', '00:04:DD': 'Cisco', '00:04:DE': 'Cisco', '00:05:00': 'Cisco', '00:05:31': 'Cisco', '00:05:32': 'Cisco', '00:05:5E': 'Cisco', '00:05:5F': 'Cisco', '00:05:73': 'Cisco', '00:05:74': 'Cisco', '00:05:9A': 'Cisco', '00:05:9B': 'Cisco', '00:05:DC': 'Cisco', '00:05:DD': 'Cisco', '00:06:28': 'Cisco', '00:06:29': 'Cisco', '00:06:52': 'Cisco', '00:06:53': 'Cisco', '00:06:7C': 'Cisco', '00:06:8C': 'Cisco', '00:06:C1': 'Cisco', '00:06:D6': 'Cisco', '00:06:D7': 'Cisco', '00:07:0D': 'Cisco', '00:07:0E': 'Cisco', '00:07:4F': 'Cisco', '00:07:50': 'Cisco', '00:07:84': 'Cisco', '00:07:85': 'Cisco', '00:07:B3': 'Cisco', '00:07:B4': 'Cisco', '00:07:EB': 'Cisco', '00:07:EC': 'Cisco', '00:08:2F': 'Cisco', '00:08:30': 'Cisco', '00:08:31': 'Cisco', '00:08:32': 'Cisco', '00:08:7C': 'Cisco', '00:08:7D': 'Cisco', '00:08:A3': 'Cisco', '00:08:A4': 'Cisco', '00:08:C7': 'Cisco', '00:08:C8': 'Cisco', '00:08:E2': 'Cisco', '00:08:E3': 'Cisco', '00:09:11': 'Cisco', '00:09:12': 'Cisco', '00:09:43': 'Cisco', '00:09:44': 'Cisco', '00:09:7B': 'Cisco', '00:09:7C': 'Cisco', '00:09:B6': 'Cisco', '00:09:B7': 'Cisco', '00:09:E8': 'Cisco', '00:09:E9': 'Cisco', '00:0A:41': 'Cisco', '00:0A:42': 'Cisco', '00:0A:8A': 'Cisco', '00:0A:8B': 'Cisco', '00:0A:B7': 'Cisco', '00:0A:B8': 'Cisco', '00:0A:F3': 'Cisco', '00:0A:F4': 'Cisco', '00:0B:45': 'Cisco',
  '00:06:25': 'Linksys', '00:0C:41': 'Linksys', '00:12:17': 'Linksys', '00:13:10': 'Linksys', '00:14:BF': 'Linksys', '00:18:F8': 'Linksys', '00:1A:70': 'Linksys', '00:1C:10': 'Linksys', '00:1D:7E': 'Linksys', '00:25:9C': 'Linksys', '00:90:A9': 'Linksys', '08:86:3B': 'Linksys', '14:91:82': 'Linksys', '20:AA:4B': 'Linksys', '30:23:03': 'Linksys', '58:6D:8F': 'Linksys', '68:74:2D': 'Linksys', 'C0:56:27': 'Linksys',
  '00:09:5B': 'Netgear', '00:14:6C': 'Netgear', '00:18:4D': 'Netgear', '00:1E:2A': 'Netgear', '00:22:3F': 'Netgear', '00:26:F2': 'Netgear', '08:02:8E': 'Netgear', '08:BD:43': 'Netgear', '10:0D:7F': 'Netgear', '20:E5:2A': 'Netgear', '28:C6:8E': 'Netgear', '30:46:9A': 'Netgear', '40:5D:82': 'Netgear', '44:94:FC': 'Netgear', '60:0F:9F': 'Netgear', '74:44:01': 'Netgear', '74:A5:28': 'Netgear', '84:1B:5E': 'Netgear', '9C:3D:CF': 'Netgear', 'A0:04:60': 'Netgear', 'A0:21:B7': 'Netgear', 'A0:40:A0': 'Netgear', 'A4:2B:8C': 'Netgear', 'B0:39:56': 'Netgear', 'B0:7F:B9': 'Netgear', 'C0:3F:0E': 'Netgear', 'C4:04:15': 'Netgear', 'C4:3D:C7': 'Netgear', 'CC:40:D0': 'Netgear', 'E8:FC:AF': 'Netgear',
  '00:07:E9': 'Intel', '00:12:F0': 'Intel', '00:13:02': 'Intel', '00:13:E8': 'Intel', '00:15:00': 'Intel', '00:16:76': 'Intel', '00:18:DE': 'Intel', '00:1B:77': 'Intel', '00:1C:C0': 'Intel', '00:1E:65': 'Intel', '00:21:5C': 'Intel', '00:22:FA': 'Intel', '00:24:D7': 'Intel', '00:27:10': 'Intel', '08:11:96': 'Intel', '10:86:89': 'Intel', '34:13:E8': 'Intel', '3C:FD:FE': 'Intel', '5C:51:88': 'Intel', '5C:87:9C': 'Intel', '60:1D:91': 'Intel', '60:6C:66': 'Intel', '7C:B0:C2': 'Intel', '80:19:34': 'Intel', '80:9B:20': 'Intel', '90:E2:BA': 'Intel', '98:4F:EE': 'Intel', 'A0:88:B4': 'Intel', 'A4:34:D9': 'Intel', 'AC:FD:93': 'Intel', 'B4:6D:83': 'Intel', 'BC:83:A7': 'Intel', 'C8:F7:50': 'Intel', 'D4:81:D7': 'Intel', 'E4:02:9B': 'Intel', 'F8:E4:FB': 'Intel',
  '00:03:7F': 'Atheros', '00:13:74': 'Atheros', '00:15:6D': 'Atheros', '00:16:CF': 'Atheros', '00:17:C5': 'Atheros', '00:18:84': 'Atheros', '00:19:66': 'Atheros', '00:1A:A9': 'Atheros', '00:1B:B1': 'Atheros', '00:1C:F0': 'Atheros', '00:1D:0F': 'Atheros', '00:1F:3A': 'Atheros', '00:21:7C': 'Atheros', '00:22:43': 'Atheros', '00:23:4D': 'Atheros', '00:24:2C': 'Atheros', '00:26:5C': 'Atheros', '00:A0:C6': 'Atheros', '04:F0:21': 'Atheros', '10:2F:6B': 'Atheros', '14:B9:68': 'Atheros', '20:76:93': 'Atheros', '40:B3:95': 'Atheros', '64:D4:DA': 'Atheros', '74:DE:2B': 'Atheros', '78:A3:E4': 'Atheros', '80:06:8C': 'Atheros', '84:C9:B2': 'Atheros', '94:FE:F4': 'Atheros', 'A0:21:97': 'Atheros', 'B4:B3:62': 'Atheros', 'C0:A0:BB': 'Atheros', 'C4:17:FE': 'Atheros', 'D8:FE:E3': 'Atheros', 'E8:DE:27': 'Atheros', 'F0:9F:C2': 'Atheros',
  '00:0A:EB': 'Apple', '00:16:CB': 'Apple', '00:17:F2': 'Apple', '00:19:E3': 'Apple', '00:1B:63': 'Apple', '00:1D:4F': 'Apple', '00:1E:52': 'Apple', '00:1F:5B': 'Apple', '00:1F:F3': 'Apple', '00:21:E9': 'Apple', '00:22:41': 'Apple', '00:23:12': 'Apple', '00:23:32': 'Apple', '00:23:6C': 'Apple', '00:23:DF': 'Apple', '00:24:36': 'Apple', '00:25:00': 'Apple', '00:25:4B': 'Apple', '00:25:BC': 'Apple', '00:26:08': 'Apple', '00:26:4A': 'Apple', '00:26:B0': 'Apple', '00:26:BB': 'Apple', '00:A0:40': 'Apple', '04:0C:CE': 'Apple', '04:1E:64': 'Apple', '08:74:02': 'Apple', '0C:74:C2': 'Apple', '10:9A:DD': 'Apple', '28:6A:BA': 'Apple', '28:E7:CF': 'Apple', '34:36:3B': 'Apple', '38:4F:F0': 'Apple', '3C:07:54': 'Apple', '40:3C:FC': 'Apple', '40:A6:77': 'Apple', '44:D8:84': 'Apple', '50:EA:D6': 'Apple', '54:26:96': 'Apple', '58:B0:35': 'Apple', '60:C5:47': 'Apple', '60:FA:CD': 'Apple', '64:A3:CB': 'Apple', '68:5B:35': 'Apple', '68:A8:6D': 'Apple', '70:3E:AC': 'Apple', '70:56:81': 'Apple', '7C:11:BE': 'Apple', '7C:C3:A1': 'Apple', '7C:F0:5F': 'Apple', '88:1F:A1': 'Apple', '88:C6:63': 'Apple', '8C:2D:AA': 'Apple', '98:FE:94': 'Apple', 'A8:86:DD': 'Apple', 'AC:BC:32': 'Apple', 'B8:17:C2': 'Apple', 'B8:8D:12': 'Apple', 'B8:E8:56': 'Apple', 'B8:F6:B1': 'Apple', 'C0:CE:CD': 'Apple', 'C8:1E:E7': 'Apple', 'CC:20:E8': 'Apple', 'F0:B4:79': 'Apple', 'F4:37:B7': 'Apple',
  '00:1A:11': 'Google', '3C:5A:B4': 'Google', '94:EB:2C': 'Google', 'A4:77:33': 'Google', 'F8:0F:F9': 'Google',
  '00:15:5D': 'Microsoft', '00:22:48': 'Microsoft', '00:50:F2': 'Microsoft', '30:59:B7': 'Microsoft', '60:45:BD': 'Microsoft', '7C:1E:52': 'Microsoft', 'C0:33:5E': 'Microsoft',
  '00:08:74': 'Dell', '00:11:43': 'Dell', '00:12:3F': 'Dell', '00:13:72': 'Dell', '00:14:22': 'Dell', '00:15:C5': 'Dell', '00:18:8B': 'Dell', '00:19:B9': 'Dell', '00:1A:A0': 'Dell', '00:1D:09': 'Dell', '00:1E:4F': 'Dell', '00:21:70': 'Dell', '00:21:9B': 'Dell', '00:22:19': 'Dell', '00:23:AE': 'Dell', '00:24:E8': 'Dell', '00:25:64': 'Dell', '00:26:B9': 'Dell', '18:03:73': 'Dell', '18:FB:7B': 'Dell', '20:47:47': 'Dell', '54:9F:13': 'Dell', '74:86:7A': 'Dell', '78:45:C4': 'Dell', '84:8F:69': 'Dell', 'B8:CA:3A': 'Dell', 'C8:1F:66': 'Dell', 'D0:43:19': 'Dell', 'D4:AE:52': 'Dell', 'E0:DB:55': 'Dell', 'F0:4D:A2': 'Dell',
  '14:CC:20': 'TP-Link', '30:B5:C2': 'TP-Link', '50:C7:BF': 'TP-Link', '64:66:B3': 'TP-Link', '70:4F:57': 'TP-Link', '8C:A6:DF': 'TP-Link', '90:F6:52': 'TP-Link', 'B0:4E:26': 'TP-Link', 'B8:F8:83': 'TP-Link', 'C0:4A:00': 'TP-Link', 'C4:6E:1F': 'TP-Link', 'CC:32:E5': 'TP-Link', 'F4:F2:6D': 'TP-Link',
  '00:17:9A': 'D-Link', '00:21:91': 'D-Link', '00:22:B0': 'D-Link', '00:24:01': 'D-Link', '00:26:5A': 'D-Link', '14:D6:4D': 'D-Link', '1C:7E:E5': 'D-Link', '28:10:7B': 'D-Link', '5C:D9:98': 'D-Link', '90:94:E4': 'D-Link', 'AC:F1:DF': 'D-Link', 'B8:A3:86': 'D-Link', 'C8:BE:19': 'D-Link', 'CC:B2:55': 'D-Link', 'FC:75:16': 'D-Link',
  '00:90:4B': 'ASUS', '08:60:6E': 'ASUS', '08:62:66': 'ASUS', '10:BF:48': 'ASUS', '14:D0:2D': 'ASUS', '18:31:BF': 'ASUS', '20:CF:30': 'ASUS', '2C:4D:54': 'ASUS', '30:5A:3A': 'ASUS', '38:2C:4A': 'ASUS', '40:16:7F': 'ASUS', '50:46:5D': 'ASUS', '54:04:A6': 'ASUS', '60:45:CB': 'ASUS', '70:4D:7B': 'ASUS', '74:D0:2B': 'ASUS', '78:24:AF': 'ASUS', '88:D7:F6': 'ASUS', '90:E6:BA': 'ASUS', 'A0:F3:C1': 'ASUS', 'BC:77:37': 'ASUS', 'BC:AE:C5': 'ASUS', 'C8:60:00': 'ASUS', 'D8:50:E6': 'ASUS', 'E0:3F:49': 'ASUS', 'F4:6D:04': 'ASUS',
  '00:0D:88': 'Broadcom', '00:10:18': 'Broadcom', '00:10:E7': 'Broadcom', '00:12:5A': 'Broadcom', '00:13:E0': 'Broadcom', '00:15:E9': 'Broadcom', '00:17:3F': 'Broadcom', '00:19:7D': 'Broadcom', '00:1B:9E': 'Broadcom', '00:1D:E1': 'Broadcom', '00:1F:E4': 'Broadcom', '00:21:45': 'Broadcom', '00:22:68': 'Broadcom', '00:23:76': 'Broadcom', '00:25:86': 'Broadcom', '00:26:4D': 'Broadcom', '00:A0:B8': 'Broadcom', '10:1C:0C': 'Broadcom', '14:A5:1A': 'Broadcom', '20:0C:C8': 'Broadcom', '44:33:4C': 'Broadcom', '48:D7:05': 'Broadcom', '5C:DA:D4': 'Broadcom', '60:A1:0A': 'Broadcom', '74:C6:3B': 'Broadcom', '80:08:30': 'Broadcom', '88:A6:C6': 'Broadcom', '90:4C:81': 'Broadcom', 'A0:D7:95': 'Broadcom', 'B0:89:00': 'Broadcom', 'B8:57:D8': 'Broadcom', 'C8:B3:73': 'Broadcom', 'D4:01:29': 'Broadcom', 'DC:0B:1A': 'Broadcom', 'E8:3E:B6': 'Broadcom', 'F0:B0:E7': 'Broadcom',
  '00:0C:E7': 'Samsung', '00:12:FB': 'Samsung', '00:15:B9': 'Samsung', '00:16:6F': 'Samsung', '00:17:D5': 'Samsung', '00:18:AF': 'Samsung', '00:1A:98': 'Samsung', '00:1B:92': 'Samsung', '00:1C:4B': 'Samsung', '00:1D:25': 'Samsung', '00:1E:6C': 'Samsung', '00:1F:CC': 'Samsung', '00:21:D1': 'Samsung', '00:22:5D': 'Samsung', '00:23:39': 'Samsung', '00:24:54': 'Samsung', '00:25:38': 'Samsung', '00:26:37': 'Samsung', '00:26:5F': 'Samsung', '08:37:3D': 'Samsung', '10:D5:42': 'Samsung', '18:1E:78': 'Samsung', '20:55:31': 'Samsung', '24:4B:03': 'Samsung', '28:3A:4D': 'Samsung', '2C:6F:C9': 'Samsung', '38:09:A4': 'Samsung', '3C:8B:F3': 'Samsung', '48:44:F7': 'Samsung', '50:A4:C8': 'Samsung', '54:88:0E': 'Samsung', '58:C3:8B': 'Samsung', '60:7A:48': 'Samsung', '60:D0:A9': 'Samsung', '6C:83:34': 'Samsung', '70:2A:D5': 'Samsung', '78:1F:DB': 'Samsung', '78:4B:87': 'Samsung', '78:A5:DD': 'Samsung', '80:18:44': 'Samsung', '84:26:2B': 'Samsung', '88:3D:D5': 'Samsung', '8C:1A:BF': 'Samsung', '90:18:7C': 'Samsung', '94:3B:B1': 'Samsung', '98:0D:2E': 'Samsung', '9C:02:98': 'Samsung', 'A0:75:91': 'Samsung', 'A8:7D:12': 'Samsung', 'AC:5F:3E': 'Samsung', 'B0:C5:59': 'Samsung', 'B4:07:F9': 'Samsung', 'BC:20:A4': 'Samsung', 'C0:11:73': 'Samsung', 'C4:57:6E': 'Samsung', 'C8:A8:23': 'Samsung', 'CC:F9:E8': 'Samsung', 'D0:60:8C': 'Samsung', 'D4:E8:B2': 'Samsung', 'D8:31:CF': 'Samsung', 'DC:1D:9F': 'Samsung', 'E0:9D:B8': 'Samsung', 'E4:B3:18': 'Samsung', 'E8:50:8B': 'Samsung', 'EC:1F:72': 'Samsung', 'F0:08:F1': 'Samsung', 'F0:24:75': 'Samsung', 'F4:7B:5E': 'Samsung', 'F8:04:2E': 'Samsung', 'FC:C7:34': 'Samsung',
  '00:0B:82': 'HUAWEI', '00:18:82': 'HUAWEI', '00:1E:10': 'HUAWEI', '00:22:A1': 'HUAWEI', '00:25:68': 'HUAWEI', '00:25:9E': 'HUAWEI', '00:46:4B': 'HUAWEI', '00:E0:FC': 'HUAWEI', '04:C0:6F': 'HUAWEI', '08:19:A6': 'HUAWEI', '08:4F:A9': 'HUAWEI', '0C:37:DC': 'HUAWEI', '10:47:80': 'HUAWEI', '18:C5:8A': 'HUAWEI', '20:0B:C7': 'HUAWEI', '20:F3:A3': 'HUAWEI', '24:69:A5': 'HUAWEI', '28:31:52': 'HUAWEI', '28:3C:E4': 'HUAWEI', '28:5F:DB': 'HUAWEI', '28:6E:D4': 'HUAWEI', '30:87:30': 'HUAWEI', '34:6D:C7': 'HUAWEI', '38:F8:B7': 'HUAWEI', '3C:DF:A9': 'HUAWEI', '40:4D:8E': 'HUAWEI', '40:CB:A8': 'HUAWEI', '44:55:B1': 'HUAWEI', '48:00:31': 'HUAWEI', '4C:1F:CC': 'HUAWEI', '4C:B1:6C': 'HUAWEI', '50:9F:27': 'HUAWEI', '54:89:98': 'HUAWEI', '54:A5:4B': 'HUAWEI', '58:1F:28': 'HUAWEI', '5C:4C:A9': 'HUAWEI', '5C:7D:5E': 'HUAWEI', '60:DE:44': 'HUAWEI', '64:16:F0': 'HUAWEI', '68:87:52': 'HUAWEI', '70:7B:E8': 'HUAWEI', '78:1D:BA': 'HUAWEI', '78:4A:E2': 'HUAWEI', '78:F5:FD': 'HUAWEI', '80:4A:14': 'HUAWEI', '80:B6:86': 'HUAWEI', '80:FB:06': 'HUAWEI', '84:A8:E4': 'HUAWEI', '88:53:D4': 'HUAWEI', '88:CE:FA': 'HUAWEI', '8C:34:FD': 'HUAWEI', '90:48:9A': 'HUAWEI', '90:67:18': 'HUAWEI', '94:7F:2A': 'HUAWEI', '9C:28:B1': 'HUAWEI', 'A0:93:47': 'HUAWEI', 'A4:99:47': 'HUAWEI', 'A8:55:45': 'HUAWEI', 'AC:E2:15': 'HUAWEI', 'B0:5B:67': 'HUAWEI', 'B4:15:13': 'HUAWEI', 'B8:BC:1A': 'HUAWEI', 'BC:3B:AF': 'HUAWEI', 'C0:70:09': 'HUAWEI', 'C8:0C:C8': 'HUAWEI', 'C8:51:95': 'HUAWEI', 'CC:A2:23': 'HUAWEI', 'D0:2D:B3': 'HUAWEI', 'D0:7A:B5': 'HUAWEI', 'D4:6A:A8': 'HUAWEI', 'D4:B1:10': 'HUAWEI', 'D8:49:0B': 'HUAWEI', 'DC:D2:FC': 'HUAWEI', 'E0:24:7F': 'HUAWEI', 'E0:97:96': 'HUAWEI', 'E4:68:A3': 'HUAWEI', 'E8:08:8B': 'HUAWEI', 'E8:CD:2D': 'HUAWEI', 'EC:23:3D': 'HUAWEI', 'F4:9F:F3': 'HUAWEI', 'F8:01:13': 'HUAWEI', 'F8:3D:FF': 'HUAWEI', 'F8:4A:BF': 'HUAWEI', 'FC:E3:3C': 'HUAWEI',
  '00:10:20': 'Realtek', '00:E0:4C': 'Realtek',
};

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