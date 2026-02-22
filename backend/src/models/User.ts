import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'admin' | 'user';
    mfaSecret?: string;
    mfaCode?: string;
    mfaExpires?: number;
    isVerified: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    mfaSecret: { type: String },
    mfaCode: { type: String },
    mfaExpires: { type: Number },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
