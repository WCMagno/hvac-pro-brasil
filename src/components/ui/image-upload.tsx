'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  Camera, 
  Image as ImageIcon, 
  FileImage,
  AlertCircle 
} from 'lucide-react'
import { uploadImage, validateImageFile, compressImage } from '@/lib/image-upload'

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  folder?: string
  title?: string
  description?: string
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

export interface UploadedImage {
  id: string
  url: string
  path: string
  filename: string
  size: number
  description?: string
  uploadDate: Date
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 10,
  folder = 'reports',
  title = 'Upload de Imagens',
  description = 'Selecione imagens do seu dispositivo ou tire fotos com a câmera',
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 10
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    
    // Validar número máximo de imagens
    if (images.length + newFiles.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitido`)
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const uploadedImages: UploadedImage[] = []
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        
        // Validar arquivo
        const validation = validateImageFile(file)
        if (!validation.isValid) {
          setError(validation.error)
          continue
        }

        // Comprimir imagem
        const compressedFile = await compressImage(file, 0.8)
        
        // Fazer upload
        const result = await uploadImage(compressedFile, folder)
        
        const uploadedImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          url: result.url,
          path: result.path,
          filename: result.filename,
          size: result.size,
          uploadDate: new Date()
        }

        uploadedImages.push(uploadedImage)
        
        // Atualizar progresso
        setUploadProgress(((i + 1) / newFiles.length) * 100)
      }

      // Atualizar estado
      const updatedImages = [...images, ...uploadedImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      
    } catch (err) {
      setError('Erro ao fazer upload das imagens')
      console.error(err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxImages, folder, onImagesChange])

  const handleRemoveImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }, [images, onImagesChange])

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  const handleFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <div>
                <p className="text-sm font-medium">Enviando imagens...</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleFileInput}
                  variant="outline"
                  className="flex flex-col gap-2 h-auto p-4"
                  disabled={images.length >= maxImages}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Selecionar Arquivos</span>
                </Button>
                
                <Button
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="flex flex-col gap-2 h-auto p-4"
                  disabled={images.length >= maxImages}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Tirar Foto</span>
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Formatos: {acceptedTypes.join(', ')} • Máximo: {maxSize}MB • 
                Limite: {images.length}/{maxImages} imagens
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Imagens ({images.length})</h3>
              <Badge variant="secondary">{images.length}/{maxImages}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(image.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-1 rounded-b-lg">
                    <p className="text-xs truncate">{image.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}