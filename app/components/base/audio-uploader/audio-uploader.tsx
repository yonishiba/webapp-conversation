'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from '@/app/components/base/toast'

type AudioUploaderProps = {
  onTextReceived: (text: string) => void
  disabled?: boolean
}

const AudioUploader: FC<AudioUploaderProps> = ({
  onTextReceived,
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const { t } = useTranslation()
  const { notify } = Toast

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // サポートされているファイル形式をチェック
    const validFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !validFormats.includes(fileExt)) {
      notify({ type: 'error', message: t('common.audioUploader.invalidFormat') })
      return
    }

    // ファイルサイズをチェック（15MB制限）
    if (file.size > 15 * 1024 * 1024) {
      notify({ type: 'error', message: t('common.audioUploader.fileSizeLimit', { size: 15 }) })
      return
    }

    try {
      setIsUploading(true)

      // FormDataを作成
      const formData = new FormData()
      formData.append('file', file)

      // APIリクエスト
      const response = await fetch('/api/audio-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to convert audio to text')
      }

      const data = await response.json()

      // 変換されたテキストを親コンポーネントに渡す
      if (data.text) {
        onTextReceived(data.text)
      } else {
        notify({ type: 'error', message: t('common.audioUploader.noTextRecognized') })
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      notify({ type: 'error', message: t('common.audioUploader.uploadError') })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <div className={`
        relative flex items-center justify-center w-8 h-8 rounded-lg
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}
        ${isUploading ? 'animate-pulse' : ''}
      `}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <input
        className={`
          absolute block inset-0 opacity-0 text-[0] w-full
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={e => (e.target as HTMLInputElement).value = ''}
        type="file"
        accept=".mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm"
        onChange={handleChange}
        disabled={disabled || isUploading}
      />
    </div>
  )
}

export default AudioUploader
