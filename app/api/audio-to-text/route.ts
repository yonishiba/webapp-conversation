import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import { existsSync, createReadStream, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import FormData from 'form-data'
import fetch from 'node-fetch'

// Vercelの一時ディレクトリを使用
const UPLOAD_DIR = '/tmp/audio-uploads'
const DIFY_API_URL = 'https://dify.votra.jp/v1/audio-to-text'
const DIFY_API_KEY = process.env.DIFY_API_KEY

export async function POST(req: NextRequest) {
  try {
    // ディレクトリが存在しない場合は作成
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // ファイル形式の検証
    const validFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExt || !validFormats.includes(fileExt)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    }

    // ファイルサイズの検証（15MB制限）
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 })
    }

    // 一時ファイルパスの生成
    const fileId = uuidv4()
    const filePath = path.join(UPLOAD_DIR, `${fileId}.${fileExt}`)
    
    // ファイルの保存
    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, new Uint8Array(arrayBuffer))

    try {
      // Dify APIにリクエスト送信
      const difyFormData = new FormData()
      const fileStream = createReadStream(filePath)
      difyFormData.append('file', fileStream)
      difyFormData.append('user', 'default-user')

      const response = await fetch(DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`
        },
        // @ts-ignore
        body: difyFormData
      })

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.status}`)
      }

      const data = await response.json()
      
      // 処理完了後、一時ファイルを削除
      await fs.unlink(filePath)
      
      return NextResponse.json(data)
    } catch (error) {
      // エラー発生時も一時ファイルを削除
      if (existsSync(filePath)) {
        await fs.unlink(filePath)
      }
      throw error
    }
  } catch (error) {
    console.error('Error converting audio to text:', error)
    return NextResponse.json({ error: 'Failed to convert audio to text' }, { status: 500 })
  }
}
