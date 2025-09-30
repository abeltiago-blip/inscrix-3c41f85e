import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EventImageUploadSectionProps {
  eventId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  primaryImageUrl?: string;
  onPrimaryImageChange: (url: string) => void;
}

export function EventImageUploadSection({ 
  eventId, 
  images, 
  onImagesChange, 
  primaryImageUrl,
  onPrimaryImageChange 
}: EventImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(file => uploadToSupabase(file));
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        const newImages = [...images, ...validUrls];
        onImagesChange(newImages);
        
        // Set first uploaded image as primary if no primary exists
        if (!primaryImageUrl && validUrls.length > 0) {
          onPrimaryImageChange(validUrls[0]);
        }
        
        toast({
          title: "Sucesso",
          description: `${validUrls.length} imagem(ns) adicionada(s) com sucesso`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload das imagens",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // If removing the primary image, set a new one
    if (imageUrl === primaryImageUrl && newImages.length > 0) {
      onPrimaryImageChange(newImages[0]);
    } else if (imageUrl === primaryImageUrl) {
      onPrimaryImageChange('');
    }

    // Delete from Supabase Storage if it's a storage URL
    if (imageUrl.includes('event-images')) {
      try {
        const fileName = imageUrl.split('/').slice(-2).join('/'); // Get eventId/filename
        await supabase.storage.from('event-images').remove([fileName]);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const setPrimaryImage = (imageUrl: string) => {
    onPrimaryImageChange(imageUrl);
    toast({
      title: "Sucesso",
      description: "Imagem principal definida",
    });
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
            • A imagem principal será usada no carrossel da homepage
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

          {/* Primary Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="primary_image_url">URL da Imagem Principal</Label>
            <div className="flex gap-2">
              <Input
                id="primary_image_url"
                value={primaryImageUrl || ''}
                onChange={(e) => onPrimaryImageChange(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg ou selecione das imagens abaixo"
              />
              {primaryImageUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={primaryImageUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
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
                  {image === primaryImageUrl && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {image !== primaryImageUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPrimaryImage(image)}
                      >
                        Principal
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
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