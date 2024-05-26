import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Could Not find the path ";
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    // console.log("File is uploaded on cloudinary....", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
