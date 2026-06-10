import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import type { CoachingTrigger } from '../../types/coaching';
import { TRIGGER_PRIORITY } from '../../types/coaching';

interface QueueItem {
  text: string;
  trigger: CoachingTrigger;
  priority: number;
}

let queue: QueueItem[] = [];
let isSpeaking = false;

function processQueue(): void {
  if (isSpeaking || queue.length === 0) return;
  queue.sort((a, b) => a.priority - b.priority);
  const item = queue.shift()!;
  isSpeaking = true;
  Speech.speak(item.text, {
    language: 'ko-KR',
    rate: 0.95,
    onDone: () => {
      isSpeaking = false;
      processQueue();
    },
    onError: () => {
      isSpeaking = false;
      processQueue();
    },
  });
}

export const TTSService = {
  speak(text: string, trigger: CoachingTrigger): void {
    const priority = TRIGGER_PRIORITY[trigger];

    // HIGH_HEART_RATE interrupts everything
    if (trigger === 'HIGH_HEART_RATE_ALERT') {
      Speech.stop();
      queue = [];
      isSpeaking = false;
    }

    queue.push({ text, trigger, priority });
    processQueue();
  },

  stop(): void {
    Speech.stop();
    queue = [];
    isSpeaking = false;
  },
};
