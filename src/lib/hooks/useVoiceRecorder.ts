import { useState, useRef, useEffect, useCallback } from 'react'
import { MAX_VOICE_DURATION_SECONDS } from '@/lib/storage'

export interface VoiceRecorderState {
  isRecording: boolean
  recordingDuration: number
  recordedBlob: Blob | null
  recordedUrl: string | null
  mimeType: string
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: () => void
}

export function useVoiceRecorder(): VoiceRecorderState {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('audio/webm')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Get best supported audio MIME type
  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm'
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  // Stop recording handler
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }, [])

  // Start recording handler (requests permission only on user click)
  const startRecording = useCallback(async () => {
    setError(null)
    setRecordedBlob(null)
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl(null)
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Audio recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const selectedMimeType = getSupportedMimeType()
      setMimeType(selectedMimeType || 'audio/webm')

      const options: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {}
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: selectedMimeType || 'audio/webm',
        })
        setRecordedBlob(finalBlob)
        const objectUrl = URL.createObjectURL(finalBlob)
        setRecordedUrl(objectUrl)
      }

      recorder.start(250) // collect chunks every 250ms
      setIsRecording(true)
      setRecordingDuration(0)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev + 1 >= MAX_VOICE_DURATION_SECONDS) {
            stopRecording()
            return MAX_VOICE_DURATION_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } catch (err: unknown) {
      console.error('[useVoiceRecorder] Microphone access error:', err)
      const isDenied =
        (err as { name?: string })?.name === 'NotAllowedError' ||
        (err as { name?: string })?.name === 'PermissionDeniedError'
      if (isDenied) {
        setError('Microphone access is required to record a voice message. Please enable microphone permissions in your browser settings.')
      } else {
        setError('Could not start audio recording. Please check your microphone.')
      }
      setIsRecording(false)
    }
  }, [recordedUrl, stopRecording])

  // Reset/discard recording
  const resetRecording = useCallback(() => {
    stopRecording()
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingDuration(0)
    setError(null)
  }, [stopRecording, recordedUrl])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
    }
  }, [recordedUrl])

  return {
    isRecording,
    recordingDuration,
    recordedBlob,
    recordedUrl,
    mimeType,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
