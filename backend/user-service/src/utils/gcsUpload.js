const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage();
// Ensure bucket name is clean (trim whitespace)
const bucketName = (process.env.GCS_BUCKET_NAME || 'omnisocial-uploads-unique-123').trim();
const bucket = storage.bucket(bucketName);

/**
 * Uploads a file to Google Cloud Storage
 * @param {Object} file - Multer file object (contains buffer)
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file uploaded'));

    // Create a unique filename
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;
    
    // Generate clean filename
    // timestamp-random-name.ext
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${originalName}${extension}`.replace(/\s+/g, '_');

    // Create a file object in the bucket (at root)
    const blob = bucket.file(fileName);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      console.error('GCS Upload Error:', err);
      reject(err);
    });

    blobStream.on('finish', () => {
      // Return the public URL
      // Format: https://storage.googleapis.com/BUCKET_NAME/FILE_NAME
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
    });

    // Write the buffer to the stream
    blobStream.end(file.buffer);
  });
};

module.exports = uploadToGCS;
