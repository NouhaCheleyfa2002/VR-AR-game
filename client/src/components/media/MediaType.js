export const MEDIA_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    AR: 'ar',
    VR: 'vr',
  };
  
export const getAcceptType = (type) => {
    switch (type) {
      case MEDIA_TYPES.IMAGE:
        return 'image/*';
      case MEDIA_TYPES.VIDEO:
        return 'video/*';
      case MEDIA_TYPES.AUDIO:
        return 'audio/*';
      case MEDIA_TYPES.AR:
      case MEDIA_TYPES.VR:
        return '.glb,.gltf,.usdz,.fbx';
      default:
        return '*/*';
    }
  };
  