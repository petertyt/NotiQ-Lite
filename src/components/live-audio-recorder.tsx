
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, StopCircle, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LiveAudioRecorderProps {
  onRecordingComplete: (audioFile: File, languageCode: string) => void;
  isLoadingProcessing: boolean; // To disable recording while other processing happens
  selectedLanguageCode: string;
}

type RecordingStatus = 'idle' | 'requesting_permission' | 'permission_denied' | 'permission_granted' | 'recording' | 'stopped';

export function LiveAudioRecorder({ onRecordingComplete, isLoadingProcessing, selectedLanguageCode }: LiveAudioRecorderProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const requestMicrophonePermission = useCallback(async () => {
    setStatus('requesting_permission');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: 'Media Devices Not Supported',
        description: 'Your browser does not support microphone access.',
        variant: 'destructive',
      });
      setStatus('permission_denied'); // Treat as denied if API not available
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStatus('permission_granted');
      toast({
        title: 'Microphone Access Granted',
        description: 'You can now start recording.',
      });
      return true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings.',
        variant: 'destructive',
      });
      setStatus('permission_denied');
      return false;
    }
  }, [toast]);

  // Automatically request permission when component mounts if not already granted/denied
  useEffect(() => {
    if (status === 'idle') {
        // Optional: auto-request permission on load. Or trigger with a button.
        // For now, let's make it explicit via a button before starting.
    }
    // Cleanup function to stop tracks if component unmounts while recording or with stream active
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [status, requestMicrophonePermission]);


  const startRecording = async () => {
    if (isLoadingProcessing) {
        toast({ title: "Processing active", description: "Please wait for current analysis to finish.", variant: "destructive"});
        return;
    }
    if (status !== 'permission_granted' && status !== 'stopped' && status !== 'idle') {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }
    // Ensure stream is active before starting
     if (!streamRef.current || streamRef.current.getTracks().some(track => track.readyState === 'ended')) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }

    if (!streamRef.current) {
        toast({ title: "Microphone not ready", description: "Could not access microphone stream.", variant: "destructive"});
        return;
    }

    audioChunksRef.current = [];
    try {
      // Determine preferred MIME type
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback if webm/opus is not supported (less common now)
        console.warn(`${options.mimeType} is not Supported. Trying default.`);
        // @ts-ignore
        options.mimeType = undefined; 
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const audioFile = new File([audioBlob], `live_recording.${audioBlob.type.split('/')[1].split(';')[0] || 'webm'}`, { type: audioBlob.type });
        
        onRecordingComplete(audioFile, selectedLanguageCode);
        setStatus('stopped');
        audioChunksRef.current = []; // Clear chunks for next recording
        // Do not stop tracks here if user might want to record again without re-requesting permission
        // streamRef.current?.getTracks().forEach(track => track.stop()); 
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({title: "Recording Error", description: "An error occurred during recording.", variant: "destructive"});
        setStatus('idle'); // Or 'permission_granted' if stream still active
      };

      mediaRecorder.start();
      setStatus('recording');
      toast({ title: 'Recording Started', description: 'Click "Stop Recording" when done.' });
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({ title: "Failed to Start Recording", description: String(error), variant: "destructive" });
      setStatus('permission_granted'); // Revert to a state where they can try again
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // streamRef.current?.getTracks().forEach(track => track.stop()); // Stop stream tracks
      // setStatus('stopped'); // onstop handler will set this
      toast({ title: 'Recording Stopped', description: 'Processing audio...' });
    }
  };
  
  const getButtonTextAndIcon = () => {
    switch (status) {
      case 'recording':
        return { text: 'Stop Recording', icon: <StopCircle className="mr-2 h-5 w-5" />, action: stopRecording, disabled: isLoadingProcessing };
      case 'requesting_permission':
      case 'permission_denied':
         return { text: 'Enable Microphone', icon: <Mic className="mr-2 h-5 w-5" />, action: requestMicrophonePermission, disabled: isLoadingProcessing };
      default: // idle, permission_granted, stopped
        return { text: 'Start Recording', icon: <Mic className="mr-2 h-5 w-5" />, action: startRecording, disabled: isLoadingProcessing };
    }
  };

  const { text, icon, action, disabled } = getButtonTextAndIcon();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-accent" />
          <span>Record Live Meeting</span>
        </CardTitle>
        <CardDescription>
          Record audio directly from your microphone for transcription and analysis. Ensure you've selected the correct audio language above.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'requesting_permission' && (
          <Alert>
            <Loader2 className="h-5 w-5 animate-spin mr-2 inline-block" />
            <AlertTitle>Requesting Permission</AlertTitle>
            <AlertDescription>Please allow microphone access in your browser.</AlertDescription>
          </Alert>
        )}
        {status === 'permission_denied' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Microphone Access Denied</AlertTitle>
            <AlertDescription>
              NotiQ Lite needs microphone access to record audio. Please enable it in your browser settings and click "Enable Microphone" or refresh the page.
            </AlertDescription>
          </Alert>
        )}
         {status === 'permission_granted' && (
          <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/30">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Microphone Ready</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Microphone access granted. You can start recording.
            </AlertDescription>
          </Alert>
        )}
        {status === 'recording' && (
           <Alert variant="default" className="border-blue-500 bg-blue-50 dark:bg-blue-900/30">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300">Recording in Progress...</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              Click "Stop Recording" below when your meeting is finished.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={action}
          disabled={disabled || (status === 'requesting_permission')}
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          variant={status === 'recording' ? 'destructive' : 'default'}
        >
          {icon}
          {text}
        </Button>

        <p className="text-xs text-muted-foreground">
          Make sure your microphone is properly connected and selected as the default input device in your system settings.
          Recordings are processed locally in your browser and only sent for transcription after you stop.
        </p>
      </CardContent>
    </Card>
  );
}
