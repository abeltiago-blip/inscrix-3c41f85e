import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function ImageUploadSection({ images, onImagesChange }: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // For now, we'll use placeholder URLs since we'd need Supabase storage setup
    // In a real implementation, you'd upload to Supabase Storage here
    setUploading(true);
    
    setTimeout(() => {
      const newImages = Array.from(files).map((file, index) => 
        URL.createObjectURL(file) // Temporary preview
      );
      onImagesChange([...images, ...newImages]);
      setUploading(false);
    }, 1000);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Imagens do Evento
        </CardTitle>
        <CardDescription>
          Adicione imagens atrativas para o seu evento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Requisitos das imagens:</strong>
            <br />
            • Formato: JPG, PNG ou WebP
            <br />
            • Dimensões recomendadas: 1200x800 pixels (ratio 3:2)
            <br />
            • Tamanho máximo: 5MB por imagem
            <br />
            • Primeira imagem será a principal (usada no carrossel da homepage)
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="images">Selecionar Imagens</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="mt-2"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="text-center text-muted-foreground">
              A carregar imagens...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}