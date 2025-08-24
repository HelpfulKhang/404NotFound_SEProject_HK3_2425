"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Crop, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface AvatarCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onCropConfirm: (blob: Blob) => Promise<void>
  uploading: boolean
}

export function AvatarCropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropConfirm,
  uploading
}: AvatarCropModalProps) {
  const [cropScale, setCropScale] = useState(1)
  const [cropRotation, setCropRotation] = useState(0)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCropPosition({ x, y })
  }

  const handleCropConfirm = async () => {
    if (!imageRef.current) return

    try {
      // Create a canvas to crop the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set canvas size to 200x200 (avatar size)
        canvas.width = 200
        canvas.height = 200
        
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Calculate crop area
          const centerX = img.width / 2 + cropPosition.x
          const centerY = img.height / 2 + cropPosition.y
          const cropSize = Math.min(img.width, img.height) / cropScale
          
          // Draw cropped image
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((cropRotation * Math.PI) / 180)
          ctx.drawImage(
            img,
            centerX - cropSize / 2,
            centerY - cropSize / 2,
            cropSize,
            cropSize,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          )
          ctx.restore()
          
          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (blob) {
              await onCropConfirm(blob)
            }
          }, 'image/jpeg', 0.9)
        }
      }
      
      img.src = imageUrl
    } catch (error) {
      console.error('Crop error:', error)
    }
  }

  const handleCancel = () => {
    setCropScale(1)
    setCropRotation(0)
    setCropPosition({ x: 0, y: 0 })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crop className="h-5 w-5" />
            <span>Chỉnh sửa ảnh đại diện</span>
          </DialogTitle>
          <DialogDescription>
            Kéo để di chuyển, sử dụng thanh trượt để phóng to/thu nhỏ và xoay ảnh
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="relative w-full h-80 flex items-center justify-center">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain cursor-move"
                onMouseDown={handleMouseDown}
                style={{
                  transform: `scale(${cropScale}) rotate(${cropRotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
              
              {/* Crop Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white shadow-lg rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phóng to/thu nhỏ</Label>
              <div className="flex items-center space-x-2">
                <ZoomOut className="h-4 w-4" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={cropScale}
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Xoay ảnh</Label>
              <div className="flex items-center space-x-2">
                <RotateCw className="h-4 w-4" />
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="15"
                  value={cropRotation}
                  onChange={(e) => setCropRotation(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{cropRotation}°</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button onClick={handleCropConfirm} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Crop className="mr-2 h-4 w-4" />
                  Xác nhận
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
