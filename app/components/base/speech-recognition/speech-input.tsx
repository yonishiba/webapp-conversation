'use client'

import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from '@/app/components/base/toast'

type SpeechInputProps = {
  onTextReceived: (text: string) => void
  disabled?: boolean
}

const SpeechInput: FC<SpeechInputProps> = ({
  onTextReceived,
  disabled,
}) => {
  const [isListening, setIsListening] = useState(false)
  const { t } = useTranslation()
  const { notify } = Toast

  // Web Speech APIのサポートチェック
  const isSpeechRecognitionSupported = () => {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }

  const startListening = () => {
    if (disabled || isListening) return

    if (!isSpeechRecognitionSupported()) {
      notify({ type: 'error', message: t('common.speechInput.browserNotSupported') })
      return
    }

    try {
      setIsListening(true)

      // Web Speech APIの初期化
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      // 設定
      recognition.lang = 'ja-JP' // 日本語設定
      recognition.interimResults = true // 途中結果も取得
      recognition.continuous = false // 連続認識はオフ

      // 結果取得時のイベント
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')

        if (event.results[0].isFinal) {
          onTextReceived(transcript)
        }
      }

      // エラー発生時
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        notify({ type: 'error', message: t('common.speechInput.recognitionError') })
        setIsListening(false)
      }

      // 認識終了時
      recognition.onend = () => {
        setIsListening(false)
      }

      // 認識開始
      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      notify({ type: 'error', message: t('common.speechInput.startError') })
      setIsListening(false)
    }
  }

  return (
    <div className="relative">
      <div
        className={`
          relative flex items-center justify-center w-8 h-8 rounded-lg
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}
          ${isListening ? 'bg-red-100 animate-pulse' : ''}
        `}
        onClick={startListening}
        title={isListening ? t('common.speechInput.listening') || '' : t('common.speechInput.start') || ''}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
    </div>
  )
}

export default SpeechInput
