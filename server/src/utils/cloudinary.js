import { v2 as cloudinary } from "cloudinary";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadProductImages = async (files = []) => {
  if (!files.length) {
    return [];
  }

  if (!hasCloudinaryConfig) {
    return files.map((file) => ({
      url: `https://placehold.co/1200x1400?text=${encodeURIComponent(file.originalname)}`,
      publicId: null,
      alt: file.originalname,
    }));
  }

  return Promise.all(
    files.map(async (file) => {
      const result = await cloudinary.uploader.upload(bufferToDataUri(file), {
        folder: "zivora/products",
        resource_type: "image",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        alt: file.originalname,
      };
    }),
  );
};
