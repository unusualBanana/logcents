"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { AudioRecorderSystem } from "@/lib/audio-recorder-system";
import { toast } from "sonner";
import { transcribeAudio } from "@/app/dashboard/transactions/actions";
import { Transaction } from "@/lib/models/transaction";
import { useCategoryStore } from "@/store/useCategoryStore";

interface VoiceRecorderUIProps {
  /** Called when recording starts */
  onStart?: () => void;
  /** Called when recording completes */
  onComplete: (data?: Partial<Transaction>) => void;
  /** Called when the recorder is closed */
  onClose?: () => void;
}

// Extracted sub-components
const CloseButton = memo(({ onClose }: { onClose?: () => void }) => (
  <button
    className="absolute top-4 right-4 text-white/70 hover:text-white"
    onClick={onClose}
  >
    <X className="w-6 h-6" />
  </button>
));
CloseButton.displayName = "CloseButton";

const RecordingStatus = memo(({ duration }: { duration: number }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full mt-2">
      <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
      <span className="text-sm font-mono text-white/90">
        {formatDuration(duration)}
      </span>
      <span className="text-xs text-white/70">Recording...</span>
    </div>
  );
});
RecordingStatus.displayName = "RecordingStatus";

const RecordButton = memo(
  ({
    isRecording,
    isProcessing,
    onPointerDown,
    onPointerUp,
  }: {
    isRecording: boolean;
    isProcessing: boolean;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  }) => (
    <Button
      className={`
      rounded-full w-20 h-20 p-0 transition-all duration-200
      ${
        isRecording
          ? "bg-destructive hover:bg-destructive/90 scale-110"
          : "bg-primary hover:bg-primary/90"
      }
      ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
    `}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: "none" }}
      disabled={isProcessing}
    >
      <Mic
        className={`w-8 h-8 text-primary-foreground ${
          isRecording ? "animate-pulse" : ""
        }`}
      />
    </Button>
  )
);
RecordButton.displayName = "RecordButton";

export default function VoiceRecorderUI({
  onStart,
  onComplete,
  onClose,
}: VoiceRecorderUIProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorderRef = useRef<AudioRecorderSystem | null>(null);

  const handleRecordingComplete = useCallback(
    async (blob: Blob | null) => {
      if (!blob) return;

      try {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", blob);

        const result = await transcribeAudio(formData);

        const categoryId = useCategoryStore
          .getState()
          .categories.find(
            (category) => category.name === result.categoryName
          )?.id;

        const transactionData: Partial<Transaction> = {
          name: result.title,
          description: result.description,
          amount: result.total,
          date: new Date(),
          categoryId: categoryId || "general",
        };
        onComplete(transactionData);
      } catch (error) {
        console.error("Error processing audio:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to process audio recording"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onComplete]
  );

  useEffect(() => {
    audioRecorderRef.current = new AudioRecorderSystem({
      onRecordingStart: () => {
        setIsRecording(true);
        setDuration(0);
        onStart?.();

        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      },
      onRecordingStop: (blob) => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleRecordingComplete(blob);
      },
      onError: (error) => {
        console.error("Recording error:", error);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      },
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioRecorderRef.current?.cleanup();
    };
  }, [onStart, handleRecordingComplete]);

  const startRecording = useCallback(async () => {
    try {
      await audioRecorderRef.current?.startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    audioRecorderRef.current?.stopRecording();
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startRecording();
    },
    [startRecording]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (isRecording) {
        stopRecording();
      }
    },
    [isRecording, stopRecording]
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <CloseButton onClose={onClose} />

      <div className="flex flex-col items-center gap-4">
        <RecordButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />

        <p className="text-sm text-white/90 text-center">
          {isProcessing
            ? "Processing recording..."
            : isRecording
            ? "Release to stop recording"
            : "Hold to record"}
        </p>

        {isRecording && <RecordingStatus duration={duration} />}
      </div>
    </div>
  );
}
