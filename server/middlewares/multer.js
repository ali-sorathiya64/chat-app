
import multer from "multer";

// Configure multer to handle file uploads with size limits and memory storage
const storage = multer.memoryStorage(); // Use memory storage for better integration with cloud uploads

const multerUpload = multer({
  storage, // Use the configured storage
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
});

// Middleware to handle single file uploads for avatar
const singleAvatar = multerUpload.single("avatar");

// Middleware to handle multiple file uploads (e.g., attachments)
const attachmentsMulter = multerUpload.array("files", 5); // Limit to 5 files

export { singleAvatar, attachmentsMulter };
