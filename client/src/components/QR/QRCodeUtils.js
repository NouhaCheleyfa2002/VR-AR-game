// components/qrcode/QRCodeUtils.js

export const isExpired = (code) => {
    return new Date(code.expirationTime) < new Date();
  };
  
  export const validateCodeScan = (code) => {
    return code.scans < code.maxScans;
  };
  
  export const scanCode = (code) => {
    return {
      ...code,
      scans: code.scans + 1,
    };
  };
  
  export const generateCode = (input) => {
    return {
      ...input,
      codeId: Math.floor(Math.random() * 100000),
      scans: 0,
    };
  };
  