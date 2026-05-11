import Resume from "../models/resumeModel.js";
import {uploadToCloudinary} from "../config/cloudinaryUpload.js"

// Upload Resume
export const uploadResume = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (
            file.buffer
                .subarray(0, 5)
                .toString() !== "%PDF-"
        ) {
            return res.status(400).json({
                message:
                    "Invalid PDF upload. Check the file path in resumereq.http.",
            });
        }

        //upload buffer to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file.buffer);

        const resume = await Resume.create({
            user: req.user._id,
      fileName: file.originalname,
      fileUrl: cloudinaryResult.secure_url, //Cloudinary URL
    });

        res.status(201).json(resume);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Upload failed" });
    }
};

// Get all resumes of user
export const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user._id });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch resumes" });
    }
};

// Get single resume
export const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.json(resume);

    } catch (err) {
        res.status(500).json({ message: "Error fetching resume" });
    }
};
