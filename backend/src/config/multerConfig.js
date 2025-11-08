const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../errors/ApiError');

const createMulterConfig = (destinationFolder, fieldName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const absolutePath = path.join(__dirname, '..', '..', 'uploads', destinationFolder);
      // Garante que o diretório de destino exista
      fs.mkdirSync(absolutePath, { recursive: true });
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      // Usa req.params.id para updates ou um ID de tenant/usuário para creates
      const id = req.params.id || req.user?.tenantId || 'unidentified';
      const generatedFilename = `${id}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, generatedFilename);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new ApiError(400, 'Apenas imagens (jpeg, jpg, png, gif) são permitidas!'));
      }
    },
  });

  return upload.single(fieldName);
};

module.exports = createMulterConfig;

