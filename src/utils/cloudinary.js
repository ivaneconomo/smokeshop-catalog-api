import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extrae el public_id de una URL de Cloudinary
// Ej: https://res.cloudinary.com/demo/image/upload/v123/folder/image.jpg → folder/image
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(url) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // No bloquear la operación principal si falla el borrado
    console.error('[Cloudinary] Error al eliminar imagen:', publicId, err.message);
  }
}
