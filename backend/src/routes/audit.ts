import { Router, Request, Response } from 'express';
import { withAuth } from '../middleware/auth';
import { withRole } from '../middleware/auth';
import { store, AuditLogEntry } from '../store/index';

const router = Router();

/* ── GET /api/audit  —  Admin only ── */
router.get('/', withAuth, withRole('admin'), (_req: Request, res: Response): void => {
    res.json(store.getAuditLogs());
});

/* ── GET /api/audit/export?format=csv|json  —  Admin only ── */
router.get('/export', withAuth, withRole('admin'), (req: Request, res: Response): void => {
    const logs = store.getAuditLogs();
    const format = (req.query.format as string)?.toLowerCase() || 'csv';
    const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'json') {
        res.setHeader('Content-Disposition', `attachment; filename="audit_log_${now}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(logs, null, 2));
        return;
    }

    /* ── CSV export ── */
    const escapeCsv = (val: unknown): string => {
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };

    const headers = ['ID', 'Timestamp (UTC)', 'Event', 'User Email', 'User ID', 'IP Address', 'Location', 'Severity', 'Meta'];
    const rows = logs.map((l: AuditLogEntry) => [
        l.id, l.timestamp, l.event, l.userEmail, l.userId, l.ip, l.location, l.severity,
        l.meta ? JSON.stringify(l.meta) : '',
    ].map(escapeCsv).join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Disposition', `attachment; filename="audit_log_${now}.csv"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send('\uFEFF' + csv); // BOM for proper Excel UTF-8 handling
});

export default router;
