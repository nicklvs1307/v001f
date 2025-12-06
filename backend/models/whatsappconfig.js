'use strict';
const {
  Model
} = require('sequelize');
const crypto = require('crypto');
const { readSecret } = require('../src/utils/secretReader');

const ENCRYPTION_KEY = readSecret('API_KEY_ENCRYPTION_KEY'); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

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
      if (config.instanceApiKey) {
        config.instanceApiKey = encrypt(config.instanceApiKey);
      }
    }

    static beforeUpdate(config, options) {
      if (config.changed('apiKey') && config.apiKey) {
        config.apiKey = encrypt(config.apiKey);
      }
      if (config.changed('instanceApiKey') && config.instanceApiKey) {
        config.instanceApiKey = encrypt(config.instanceApiKey);
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
    instanceApiKey: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('instanceApiKey');
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
    },
    sendPrizeMessage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    prizeMessageTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Parabéns, {{cliente}}! Você ganhou um prêmio: {{premio}}. Use o cupom {{cupom}} para resgatar.',
    },
    dailyReportEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reportPhoneNumbers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birthdayAutomationEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    birthdayMessageTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Feliz aniversário, {{cliente}}! Ganhe {{recompensa}} com o cupom {{cupom}}.',
    },
    birthdayDaysBefore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    birthdayRewardType: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // 'recompensa', 'roleta'
    birthdayRewardId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    birthdayCouponValidityDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    sendDetractorMessageToClient: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    detractorMessageTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Olá, {{cliente}}. Vimos que você teve um problema conosco e gostaríamos de entender melhor. Podemos ajudar de alguma forma?',
    },
    notifyDetractorToOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    detractorOwnerMessageTemplate: {
      type: DataTypes.TEXT,
      defaultValue: 'Alerta de Detrator: Cliente {{cliente}} deu a nota {{nota}}. Comentário: {{comentario}}',
      allowNull: true,
    },
    detractorOwnerPhoneNumbers: {
      type: DataTypes.TEXT,
      allowNull: true,
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