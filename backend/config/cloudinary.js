const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'warung_sembako', // Nama folder di dalam Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const afterUpload = imageUrl.split('/upload/')[1];
    if (!afterUpload) return;
    let path = afterUpload;
    if (path.match(/^v\d+\//)) {
      path = path.substring(path.indexOf('/') + 1);
    }
    const public_id = path.substring(0, path.lastIndexOf('.'));
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

module.exports = { cloudinary, upload, deleteCloudinaryImage };
