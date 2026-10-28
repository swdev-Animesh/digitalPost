import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const fileStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, PDF, and MP4 files are allowed.",
        ),
        false,
      );
    }
  },
});
