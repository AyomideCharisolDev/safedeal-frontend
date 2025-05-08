import axios from 'axios';
import CryptoJS from 'crypto-js';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type?: string;
  format?: string;
}

interface UploadProgressInfo {
  fileName: string;
  progress: number;
}

const cloudName = 'dv5skyhvl';
const uploadPreset = 'ml_default';

// Determine resource type based on file type
const getResourceType = (file: File): string => {
  const fileType = file.type;
  
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.startsWith('video/')) {
    return 'video';
  } else {
    // For PDFs, DOCs, TXTs, and other files
    return 'raw';
  }
};

// Function to upload any file type with progress tracking
const uploadToCloudinary = async (
  file: File,
  onProgress?: (info: any) => void
): Promise<CloudinaryUploadResponse | null> => {
  const resourceType = getResourceType(file);
  const formData = new FormData();
  
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              fileName: file.name,
              progress: percentCompleted,
            });
          }
        },
      }
    );

    const { secure_url, public_id, format } = response.data;
    return { 
      secure_url, 
      public_id,
      resource_type: resourceType,
      format
    };
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    return null;
  }
};

// For backward compatibility - use this as a replacement for the original function
const uploadSingleImageToCloudinary = async (
  file: File,
  onProgress?: (info: any) => void
): Promise<CloudinaryUploadResponse | null> => {
  return uploadToCloudinary(file, onProgress);
};

// Function to upload multiple files with progress tracking
const uploadMultipleToCloudinary = async (
  files: File[],
  onProgress?: (info: UploadProgressInfo) => void,
  onComplete?: (results: (CloudinaryUploadResponse | null)[]) => void
): Promise<(CloudinaryUploadResponse | null)[]> => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file, onProgress)
  );

  try {
    const results = await Promise.all(uploadPromises);
    if (onComplete) {
      onComplete(results);
    }
    return results;
  } catch (error) {
    console.error('Error in batch upload:', error);
    return Array(files.length).fill(null);
  }
};

// Upload from URL or base64
const uploadFromUrlToCloudinary = async (
  imageData: string,
  resourceType: string = 'image',
  onProgress?: (info: any) => void
): Promise<CloudinaryUploadResponse | null> => {
  // Convert base64 data URL to blob for upload
  const response = await fetch(imageData);
  const blob: any = await response.blob();

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              fileName: blob.name || 'unnamed',
              progress: percentCompleted,
            });
          }
        },
      }
    );

    const { secure_url, public_id } = response.data;
    return { secure_url, public_id, resource_type: resourceType };
  } catch (error) {
    console.error(`Error uploading from URL:`, error);
    return null;
  }
};

// Delete any type of resource
const deleteFromCloudinary = async (publicId: string, resourceType: string = 'image'): Promise<boolean> => {
  const apiKey = "839715384777538";
  const apiSecret = "iJiApRMnr3dFUoW-G81NB2UPWjU";
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Generate a signature using your API secret
  const signature = CryptoJS.SHA1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`).toString();
  
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('signature', signature);
  
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result === 'ok';
  } catch (error) {
    console.error(`Error deleting resource:`, error);
    return false;
  }
};

// Original functions with updated names for clarity
const uploadSingleImageUrlToCloudinary = uploadFromUrlToCloudinary;
const uploadImagesToCloudinary = uploadMultipleToCloudinary;
const deleteImageFromCloudinary = (publicId: string) => deleteFromCloudinary(publicId, 'image');

export {
  uploadToCloudinary,
  uploadSingleImageToCloudinary,
  uploadImagesToCloudinary,
  uploadFromUrlToCloudinary,
  uploadSingleImageUrlToCloudinary,
  deleteFromCloudinary,
  deleteImageFromCloudinary,
};