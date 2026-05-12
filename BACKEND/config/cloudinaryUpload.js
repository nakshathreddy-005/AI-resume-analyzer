import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "resumes",resource_type:"raw" }, (err, result) => {
      if (err) return reject(err);
      if (!result?.secure_url) return reject(new Error("Cloudinary upload did not return a file URL"));
      resolve(result);
    });
    stream.end(buffer);
  });
};
