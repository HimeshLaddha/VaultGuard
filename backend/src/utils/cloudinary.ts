import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'vaultguard';

/** Upload a buffer to Cloudinary and return the secure URL + public_id */
export async function uploadToCloudinary(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
): Promise<{ url: string; publicId: string }> {
    // Cloudinary treats PDFs as 'image', everything else non-image is 'raw'
    const resourceType: 'image' | 'raw' | 'video' | 'auto' =
        mimeType.startsWith('image/') || mimeType === 'application/pdf' ? 'image' : 'raw';

    // Use base64 data URI — works reliably on Windows without temp files
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, {
        folder: CLOUDINARY_FOLDER,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        // note: access_mode 'authenticated' requires a paid plan — omit for free tier
    });
    return { url: result.secure_url, publicId: result.public_id };
}

/** Generate a short-lived signed URL for a private Cloudinary resource */
export function getSignedUrl(publicId: string, mimeType: string): string {
    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
    return cloudinary.url(publicId, {
        resource_type: resourceType,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 15, // 15-min expiry
        secure: true,
        attachment: true, // force download
    });
}

/** Delete a resource from Cloudinary */
export async function deleteFromCloudinary(publicId: string, mimeType: string): Promise<void> {
    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };
