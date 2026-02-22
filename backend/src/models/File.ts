import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    sizeLabel: string;
    uploadedBy: string; // user id string
    uploadedByEmail: string;
    uploadedAt: Date;
    encryptedBy: string;
    status: 'secure' | 'scanning' | 'flagged';
    path: string;
    cloudinaryPublicId?: string;
    cloudUrl?: string;
}

const FileSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    sizeLabel: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploadedByEmail: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    encryptedBy: { type: String, required: true },
    status: { type: String, enum: ['secure', 'scanning', 'flagged'], default: 'scanning' },
    path: { type: String, required: true },
    cloudinaryPublicId: { type: String },
    cloudUrl: { type: String },
});

export default mongoose.model<IFile>('File', FileSchema);
