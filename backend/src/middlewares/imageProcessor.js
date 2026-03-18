const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Middleware para processar imagens após o upload do multer.
 * Redimensiona e converte para WebP.
 * @param {Object} options - Opções de processamento (width, height, quality)
 */
const processImage = (options = {}) => {
  return async (req, res, next) => {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    const { 
      width = 800, 
      height = null, 
      quality = 80,
      fit = 'inside'
    } = options;

    const originalPath = req.file.path;
    const fileDir = path.dirname(originalPath);
    const fileName = path.basename(originalPath, path.extname(originalPath));
    const newFileName = `${fileName}.webp`;
    const newPath = path.join(fileDir, newFileName);

    try {
      // Processamento com Sharp
      let pipeline = sharp(originalPath);
      
      // Redimensiona apenas se necessário
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit: fit,
          withoutEnlargement: true
        });
      }

      // Converte para WebP
      await pipeline
        .webp({ quality })
        .toFile(newPath);

      // Remove o arquivo original para economizar espaço
      try {
        fs.unlinkSync(originalPath);
      } catch (unlinkErr) {
        console.warn(`Aviso: Não foi possível remover o arquivo original ${originalPath}`, unlinkErr);
      }

      // Atualiza o objeto req.file com as novas informações
      req.file.path = newPath;
      req.file.filename = newFileName;
      req.file.mimetype = 'image/webp';
      req.file.size = fs.statSync(newPath).size;

      next();
    } catch (error) {
      console.error('Erro no processamento de imagem:', error);
      // Em caso de erro, mantemos o arquivo original e seguimos
      next();
    }
  };
};

module.exports = { processImage };
