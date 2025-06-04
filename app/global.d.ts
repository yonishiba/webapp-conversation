declare module 'dify-client';
declare module 'uuid';

// Web Speech API型定義
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
