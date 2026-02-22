"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const index_1 = require("../store/index");
const router = (0, express_1.Router)();
/* ── GET /api/audit  —  Admin only ── */
router.get('/', auth_1.withAuth, (0, auth_2.withRole)('admin'), (_req, res) => {
    res.json(index_1.store.getAuditLogs());
});
/* ── GET /api/audit/export?format=csv|json  —  Admin only ── */
router.get('/export', auth_1.withAuth, (0, auth_2.withRole)('admin'), (req, res) => {
    const logs = index_1.store.getAuditLogs();
    const format = req.query.format?.toLowerCase() || 'csv';
    const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    if (format === 'json') {
        res.setHeader('Content-Disposition', `attachment; filename="audit_log_${now}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(logs, null, 2));
        return;
    }
    /* ── CSV export ── */
    const escapeCsv = (val) => {
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const headers = ['ID', 'Timestamp (UTC)', 'Event', 'User Email', 'User ID', 'IP Address', 'Location', 'Severity', 'Meta'];
    const rows = logs.map((l) => [
        l.id, l.timestamp, l.event, l.userEmail, l.userId, l.ip, l.location, l.severity,
        l.meta ? JSON.stringify(l.meta) : '',
    ].map(escapeCsv).join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Disposition', `attachment; filename="audit_log_${now}.csv"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send('\uFEFF' + csv); // BOM for proper Excel UTF-8 handling
});
exports.default = router;
