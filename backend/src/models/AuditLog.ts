import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    id: string;
    event: string;
    userId: string;
    userEmail: string;
    ip: string;
    location: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: Date;
    meta?: Record<string, any>;
}

const AuditLogSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    ip: { type: String, required: true },
    location: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    timestamp: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed },
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
