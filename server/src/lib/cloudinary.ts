import { v2 as cloudinary } from "cloudinary";
import env from "./config";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: File,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
          access_mode: "public",
          type: "upload", // Explicitly standard upload
        },
        (error, result) => {
          if (error) return reject(error);
          if (result)
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
        },
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export const getPublicIdFromUrl = (url: string) => {
  const parts = url.split("/");
  const filenameWithExtension = parts[parts.length - 1];
  if (!filenameWithExtension) return "";
  const filename = filenameWithExtension.split(".")[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename}`;
};
