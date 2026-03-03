const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('../utils/logger');


exports.generate = async (data) => {
  try {
  
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data) + process.env.JWT_SECRET)
      .digest('hex')
      .substring(0, 16);
    
    
    const qrData = {
      ...data,
      hash,
      version: '1.0'
    };
    
  
    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify(qrData),
      {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }
    );
    
    logger.debug(`QR code generated for ticket ${data.ticketNumber}`);
    
    return qrCodeDataUrl;
    
  } catch (error) {
    logger.error('QR code generation error:', error);
    throw error;
  }
};


exports.verify = (qrData) => {
  try {
    const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    const { hash, ...data } = parsed;
    
   
    const expectedHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data) + process.env.JWT_SECRET)
      .digest('hex')
      .substring(0, 16);
    
    
    const isValid = hash === expectedHash;
    
    if (!isValid) {
      logger.warn('Invalid QR code hash detected');
    }
    
    return {
      isValid,
      data: isValid ? data : null
    };
    
  } catch (error) {
    logger.error('QR code verification error:', error);
    return {
      isValid: false,
      data: null
    };
  }
};


exports.generateBuffer = async (data) => {
  try {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data) + process.env.JWT_SECRET)
      .digest('hex')
      .substring(0, 16);
    
    const qrData = { ...data, hash, version: '1.0' };
    
    const buffer = await QRCode.toBuffer(
      JSON.stringify(qrData),
      {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 300,
        margin: 2
      }
    );
    
    return buffer;
    
  } catch (error) {
    logger.error('QR code buffer generation error:', error);
    throw error;
  }
};