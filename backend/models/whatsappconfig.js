'use strict';
const {
  Model
} = require('sequelize');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY) {
  console.error('API_KEY_ENCRYPTION_KEY is not defined in .env. Please set it for security.');
  // Em um ambiente de produção, você pode querer lançar um erro ou sair do processo.
}

function encrypt(text) {
  if (!ENCRYPTION_KEY) return text; // Retorna texto simples se a chave não estiver definida (apenas para desenvolvimento/teste)
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!ENCRYPTION_KEY || !text || typeof text !== 'string' || text.indexOf(':') === -1) {
    return text; // Retorna texto simples se a chave não estiver definida ou formato inválido
  }
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Erro ao descriptografar API Key:', error.message);
    return text; // Em caso de erro na descriptografia, retorna o texto original (pode ser um erro de chave)
  }
}

module.exports = (sequelize, DataTypes) => {
  class WhatsappConfig extends Model {
    static associate(models) {
      WhatsappConfig.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }

    // Hooks para criptografar a apiKey antes de salvar
    static beforeCreate(config, options) {
      if (config.apiKey) {
        config.apiKey = encrypt(config.apiKey);
      }
    }

    static beforeUpdate(config, options) {
      if (config.changed('apiKey') && config.apiKey) {
        config.apiKey = encrypt(config.apiKey);
      }
    }
  }
  WhatsappConfig.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('apiKey');
        return decrypt(rawValue);
      }
    },
    instanceName: DataTypes.STRING,
    instanceStatus: {
      type: DataTypes.STRING,
      defaultValue: 'disconnected'
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'WhatsappConfig',
    tableName: 'whatsapp_configs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return WhatsappConfig;
};