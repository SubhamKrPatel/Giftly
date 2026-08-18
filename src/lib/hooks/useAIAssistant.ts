import { useState, useCallback } from 'react'
import {
  generateMessage,
  improveMessage,
  generateFullGiftContent,
  type GenerateMessageParams,
  type ImproveMessageParams,
  type GenerateFullGiftParams,
  type GeneratedMessageResult,
  type GeneratedFullGiftResult,
} from '@/lib/services/aiService'

export function useAIAssistant() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)

  const generateNewMessage = useCallback(
    async (params: GenerateMessageParams): Promise<GeneratedMessageResult | null> => {
      setIsGenerating(true)
      setError(null)
      setLimitReached(false)

      try {
        const res = await generateMessage(params)
        if (res.error) {
          setError(res.error)
          if (res.limitReached) setLimitReached(true)
          return null
        }
        if (res.usageRemaining !== undefined) {
          setUsageRemaining(res.usageRemaining)
        }
        return res.data || null
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI generation failed'
        setError(msg)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  const improveCurrentMessage = useCallback(
    async (params: ImproveMessageParams): Promise<GeneratedMessageResult | null> => {
      setIsGenerating(true)
      setError(null)
      setLimitReached(false)

      try {
        const res = await improveMessage(params)
        if (res.error) {
          setError(res.error)
          if (res.limitReached) setLimitReached(true)
          return null
        }
        if (res.usageRemaining !== undefined) {
          setUsageRemaining(res.usageRemaining)
        }
        return res.data || null
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI improvement failed'
        setError(msg)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  const generateFullGift = useCallback(
    async (params: GenerateFullGiftParams): Promise<GeneratedFullGiftResult | null> => {
      setIsGenerating(true)
      setError(null)
      setLimitReached(false)

      try {
        const res = await generateFullGiftContent(params)
        if (res.error) {
          setError(res.error)
          if (res.limitReached) setLimitReached(true)
          return null
        }
        if (res.usageRemaining !== undefined) {
          setUsageRemaining(res.usageRemaining)
        }
        return res.data || null
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI gift generation failed'
        setError(msg)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
    setLimitReached(false)
  }, [])

  return {
    isGenerating,
    error,
    limitReached,
    usageRemaining,
    generateNewMessage,
    improveCurrentMessage,
    generateFullGift,
    clearError,
  }
}
