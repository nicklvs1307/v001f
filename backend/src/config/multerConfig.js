const multer = require('multer');
const path = require('path');
const ApiError = require('../errors/ApiError');

const createMulterConfig = (destinationFolder, fieldName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Usar path.join para construir um caminho absoluto e robusto
      const absolutePath = path.join(__dirname, '..', '..', 'uploads', destinationFolder);
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      // req.params.id pode não estar disponível em todas as rotas, usar um fallback ou garantir que esteja presente
      const id = req.params.id || 'unknown';
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
        // Usar ApiError para consistência
        cb(new ApiError(400, 'Apenas imagens (jpeg, jpg, png, gif) são permitidas!'));
      }
    },
  });

  return upload.single(fieldName);
};

module.exports = createMulterConfig;
