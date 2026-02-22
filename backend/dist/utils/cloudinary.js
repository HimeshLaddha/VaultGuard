"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.CLOUDINARY_FOLDER = void 0;
exports.uploadToCloudinary = uploadToCloudinary;
exports.getSignedUrl = getSignedUrl;
exports.deleteFromCloudinary = deleteFromCloudinary;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
exports.CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'vaultguard';
/** Upload a buffer to Cloudinary and return the secure URL + public_id */
async function uploadToCloudinary(buffer, originalName, mimeType) {
    // Cloudinary treats PDFs as 'image', everything else non-image is 'raw'
    const resourceType = mimeType.startsWith('image/') || mimeType === 'application/pdf' ? 'image' : 'raw';
    // Use base64 data URI — works reliably on Windows without temp files
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const result = await cloudinary_1.v2.uploader.upload(base64Data, {
        folder: exports.CLOUDINARY_FOLDER,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        // note: access_mode 'authenticated' requires a paid plan — omit for free tier
    });
    return { url: result.secure_url, publicId: result.public_id };
}
/** Generate a short-lived signed URL for a private Cloudinary resource */
function getSignedUrl(publicId, mimeType) {
    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
    return cloudinary_1.v2.url(publicId, {
        resource_type: resourceType,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 15, // 15-min expiry
        secure: true,
        attachment: true, // force download
    });
}
/** Delete a resource from Cloudinary */
async function deleteFromCloudinary(publicId, mimeType) {
    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType });
}
