export interface AudioRecorderState {
  isRecording: boolean;
  recordedURL: string;
}

export interface AudioRecorderCallbacks {
  onRecordingStart?: () => void;
  onRecordingStop?: (blob: Blob | null) => void;
  onError?: (error: Error) => void;
}

export class AudioRecorderSystem {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private state: AudioRecorderState = {
    isRecording: false,
    recordedURL: "",
  };

  constructor(private callbacks: AudioRecorderCallbacks = {}) {}

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => e.data.size > 0 && this.chunks.push(e.data);
      this.mediaRecorder.onstop = this.handleRecordingStop.bind(this);

      this.mediaRecorder.start();
      this.state.isRecording = true;
      this.callbacks.onRecordingStart?.();
    } catch (error) {
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private handleRecordingStop(): void {
    const recordedBlob = new Blob(this.chunks, { type: "audio/mp3" });
    this.state.recordedURL = URL.createObjectURL(recordedBlob);
    this.chunks = [];
    this.callbacks.onRecordingStop?.(recordedBlob);
  }

  stopRecording(): void {
    if (!this.mediaRecorder) return;
    
    this.mediaRecorder.stop();
    this.cleanupMediaStream();
    this.state.isRecording = false;
  }

  cancelRecording(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.stop();
    this.cleanupMediaStream();
    this.chunks = [];
    
    if (this.state.recordedURL) {
      URL.revokeObjectURL(this.state.recordedURL);
      this.state.recordedURL = "";
    }
    
    this.state.isRecording = false;
    this.callbacks.onRecordingStop?.(null);
  }

  private cleanupMediaStream(): void {
    this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
  }

  getState(): AudioRecorderState {
    return { ...this.state };
  }

  cleanup(): void {
    this.cleanupMediaStream();
    if (this.state.recordedURL) {
      URL.revokeObjectURL(this.state.recordedURL);
    }
  }
} 