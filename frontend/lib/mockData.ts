export type FileItem = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  encryptedBy: string;
  status: 'secure' | 'scanning' | 'flagged';
};

export type AuditLog = {
  id: string;
  event: string;
  user: string;
  ip: string;
  location: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
};

export const mockFiles: FileItem[] = [
  { id: '1', name: 'Q4_Financial_Report.pdf', size: '3.2 MB', type: 'PDF', uploadedAt: '2026-02-20 09:14', encryptedBy: 'AES-256', status: 'secure' },
  { id: '2', name: 'Employee_Contracts_2026.docx', size: '1.8 MB', type: 'DOCX', uploadedAt: '2026-02-19 17:42', encryptedBy: 'AES-256', status: 'secure' },
  { id: '3', name: 'Infrastructure_Diagram.png', size: '5.1 MB', type: 'PNG', uploadedAt: '2026-02-19 11:05', encryptedBy: 'AES-256', status: 'secure' },
  { id: '4', name: 'Compliance_Audit_2025.pdf', size: '8.7 MB', type: 'PDF', uploadedAt: '2026-02-18 14:30', encryptedBy: 'AES-256', status: 'scanning' },
  { id: '5', name: 'Product_Roadmap_Confidential.docx', size: '2.4 MB', type: 'DOCX', uploadedAt: '2026-02-18 08:21', encryptedBy: 'AES-256', status: 'secure' },
  { id: '6', name: 'Server_Access_Logs_Jan.txt', size: '0.9 MB', type: 'TXT', uploadedAt: '2026-02-17 22:15', encryptedBy: 'AES-256', status: 'flagged' },
  { id: '7', name: 'Board_Meeting_Minutes.pdf', size: '1.1 MB', type: 'PDF', uploadedAt: '2026-02-17 16:48', encryptedBy: 'AES-256', status: 'secure' },
  { id: '8', name: 'API_Keys_Backup.txt', size: '0.2 MB', type: 'TXT', uploadedAt: '2026-02-16 10:33', encryptedBy: 'AES-256', status: 'flagged' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', event: 'User Login', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 14:08:33', severity: 'info' },
  { id: '2', event: 'File Uploaded', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 09:14:11', severity: 'info' },
  { id: '3', event: 'MFA Verified', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 09:13:58', severity: 'info' },
  { id: '4', event: 'Failed Login Attempt', user: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', timestamp: '2026-02-19 23:42:07', severity: 'critical' },
  { id: '5', event: 'Failed Login Attempt', user: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', timestamp: '2026-02-19 23:41:52', severity: 'critical' },
  { id: '6', event: 'File Downloaded', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-19 17:55:21', severity: 'info' },
  { id: '7', event: 'Password Changed', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-19 12:30:00', severity: 'warning' },
  { id: '8', event: 'API Key Accessed', user: 'admin@vault.io', ip: '10.0.0.15', location: 'New York, US', timestamp: '2026-02-18 08:25:44', severity: 'warning' },
  { id: '9', event: 'File Flagged', user: 'system', ip: 'internal', location: '–', timestamp: '2026-02-17 22:15:10', severity: 'critical' },
  { id: '10', event: 'User Logout', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-17 18:00:00', severity: 'info' },
  { id: '11', event: 'MFA Code Resent', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-17 09:33:19', severity: 'info' },
  { id: '12', event: 'New Session Started', user: 'admin@vault.io', ip: '192.168.1.102', location: 'New York, US', timestamp: '2026-02-16 08:10:05', severity: 'info' },
];
