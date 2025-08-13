import { createClient } from './supabase'

export interface UploadImageResult {
  url: string
  path: string
  filename: string
  size: number
}

export async function uploadImage(
  file: File,
  folder: string = 'reports',
  description?: string
): Promise<UploadImageResult> {
  const supabase = createClient()
  
  try {
    // Gerar nome de arquivo único
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('hvac-images')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`)
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('hvac-images')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
      filename: fileName,
      size: file.size
    }
  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    throw error
  }
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from('hvac-images')
      .remove([path])

    if (error) {
      throw new Error(`Erro ao deletar imagem: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    throw error
  }
}

export async function getImagesFromFolder(folder: string): Promise<string[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.storage
      .from('hvac-images')
      .list(folder)

    if (error) {
      throw new Error(`Erro ao listar imagens: ${error.message}`)
    }

    return data.map(item => {
      const { data: { publicUrl } } = supabase.storage
        .from('hvac-images')
        .getPublicUrl(`${folder}/${item.name}`)
      return publicUrl
    })
  } catch (error) {
    console.error('Erro ao listar imagens:', error)
    throw error
  }
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. O tamanho máximo é 10MB.'
    }
  }

  return { isValid: true }
}

export function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões (máximo 1920x1080)
      let { width, height } = img
      const maxWidth = 1920
      const maxHeight = 1080

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erro ao comprimir imagem'))
            return
          }

          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })

          resolve(compressedFile)
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}