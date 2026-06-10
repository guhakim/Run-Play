import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';

export const ShareCardService = {
  async captureAndShare(ref: RefObject<any>): Promise<void> {
    const uri = await captureRef(ref, {
      format: 'jpg',
      quality: 0.95,
      width: 1080,
      height: 1080,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/jpeg',
      dialogTitle: '런플 기록 공유하기',
    });
  },
};
