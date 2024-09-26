import type { AppInfo } from '@/types/app'
export const APP_ID = `${process.env.NEXT_PUBLIC_APP_ID}`
export const API_KEY = `${process.env.NEXT_PUBLIC_APP_KEY}`
export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`
export const APP_INFO: AppInfo = {
  title: 'Sample Chatbot',
  description: 'プロンプトや生成AIについて質問してください。\n',
  //  + '※このAIチャットは東京都 デジタルサービス局が公開している「都職員のアイデアが詰まった文章生成AI活用事例集」を引用として読み込ませ、その内容から回答するチャットボットです。',
  copyright: 'VOTRA Co., Ltd.',
  privacy_policy: '',
  default_language: 'en',
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
