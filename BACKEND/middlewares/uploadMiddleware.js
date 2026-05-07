/*import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// File filter (only allow pdf/doc/docx)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, DOC, DOCX files are allowed"));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

export default upload;*/