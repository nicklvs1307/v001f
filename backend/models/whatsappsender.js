'use strict';
const { Model } = require('sequelize');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
  if (!ENCRYPTION_KEY) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!ENCRYPTION_KEY || !text || typeof text !== 'string' || text.indexOf(':') === -1) {
    return text;
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
    console.error('Erro ao descriptografar API Key do Sender:', error.message);
    return text;
  }
}

module.exports = (sequelize, DataTypes) => {
  class WhatsappSender extends Model {
    static associate(models) {
      // No associations needed for now
    }

    static beforeCreate(sender, options) {
      if (sender.apiKey) {
        sender.apiKey = encrypt(sender.apiKey);
      }
    }

    static beforeUpdate(sender, options) {
      if (sender.changed('apiKey') && sender.apiKey) {
        sender.apiKey = encrypt(sender.apiKey);
      }
    }
  }

  WhatsappSender.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apiUrl: {
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
      instanceName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'warming_up', 'resting', 'blocked', 'disconnected'),
        allowNull: false,
        defaultValue: 'disconnected',
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      dailyLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      messagesSentToday: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      warmingUpDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'WhatsappSender',
      tableName: 'WhatsappSenders',
      timestamps: true,
    }
  );

  return WhatsappSender;
};
