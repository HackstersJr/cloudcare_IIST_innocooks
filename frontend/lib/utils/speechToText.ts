// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: any;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Speech-to-Text utility using Web Speech API
export class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResult: (text: string) => void = () => {};
  private onStateChange: (isListening: boolean) => void = () => {};
  private onInterimResult: (text: string) => void = () => {};

  constructor() {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionCtor();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default language, supports multilingual
    this.recognition.maxAlternatives = 1;

    // Handle results
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Send interim results for real-time display
      if (interimTranscript) {
        this.onInterimResult(interimTranscript.trim());
      }

      if (finalTranscript) {
        this.onResult(finalTranscript.trim());
      }
    };

    // Handle errors
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.stop();
    };

    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
      this.onStateChange(false);
    };

    // Handle start
    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange(true);
    };
  }

  // Set language for multilingual support
  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // Available languages (most common ones)
  public getAvailableLanguages() {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'hi-IN', name: 'Hindi' },
      { code: 'ar-SA', name: 'Arabic' }
    ];
  }

  public start(
    onResult: (text: string) => void, 
    onStateChange: (isListening: boolean) => void,
    onInterimResult?: (text: string) => void
  ) {
    this.onResult = onResult;
    this.onStateChange = onStateChange;
    this.onInterimResult = onInterimResult || (() => {});

    if (!this.recognition) {
      alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (this.isListening) {
      this.stop();
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }
}

// Global speech recognition instance
export const speechToText = new SpeechToText();