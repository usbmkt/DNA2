'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AudioRecorderProps {
  questionText: string;
  questionIndex: number;
  sessionId: string;
  onTranscriptionComplete: (transcript: string, responseId: string) => void;
  existingTranscript?: string;
}

export function AudioRecorder({
  questionText,
  questionIndex,
  sessionId,
  onTranscriptionComplete,
  existingTranscript
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>(existingTranscript || '');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Atualiza o transcript quando existingTranscript muda
  useEffect(() => {
    if (existingTranscript) {
      setTranscript(existingTranscript);
    } else {
      setTranscript('');
    }
  }, [existingTranscript]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
        
        // Para todas as faixas do stream para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Inicia o timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o microfone. Verifique as permissões.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    }
  }, [audioBlob, isPlaying]);

  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const submitRecording = useCallback(async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');
      formData.append('sessionId', sessionId);
      formData.append('questionIndex', questionIndex.toString());
      formData.append('questionText', questionText);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha na transcrição');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      onTranscriptionComplete(data.transcript, data.response_id);

      toast({
        title: 'Sucesso',
        description: 'Áudio processado e salvo com sucesso!',
      });

    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar o áudio. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, sessionId, questionIndex, questionText, onTranscriptionComplete, toast]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setTranscript('');
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          Pergunta {questionIndex + 1}
        </CardTitle>
        <CardDescription className="text-base">
          {questionText}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mostra transcrição existente se houver */}
        {transcript && !audioBlob && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">Resposta Salva:</h3>
              <p className="text-gray-700">{transcript}</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={resetRecording} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Gravar Nova Resposta
              </Button>
            </div>
          </div>
        )}

        {/* Controles de Gravação */}
        {!transcript && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-mono">
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex gap-4">
              {!isRecording && !audioBlob && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Iniciar Gravação
                </Button>
              )}
              
              {isRecording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Parar Gravação
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Visualização da Gravação */}
        {isRecording && (
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-red-500 rounded animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 30}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Controles de Reprodução */}
        {audioBlob && !transcript && (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={isPlaying ? stopPlaying : playRecording}
                variant="outline"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? 'Pausar' : 'Reproduzir'}
              </Button>
              
              <Button onClick={resetRecording} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Gravar Novamente
              </Button>
              
              <Button 
                onClick={submitRecording}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}

        {/* Indicador de Processamento */}
        {isProcessing && (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-sm text-gray-600">Processando áudio...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}