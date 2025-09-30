import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, List, ListOrdered, Quote, Eye, Edit3 } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Escreva aqui...", 
  rows = 6 
}: RichTextEditorProps) {
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const insertFormatting = (prefix: string, suffix = "", placeholder = "texto") => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    const newValue = before + prefix + textToInsert + suffix + after;
    onChange(newValue);

    // Set cursor position after formatting
    setTimeout(() => {
      const newCursorPos = start + prefix.length + textToInsert.length + suffix.length;
      textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.focus();
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    const newValue = before + text + after;
    onChange(newValue);
    
    setTimeout(() => {
      const newCursorPos = start + text.length;
      textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.focus();
    }, 0);
  };

  const formatBold = () => insertFormatting("**", "**", "texto em negrito");
  const formatItalic = () => insertFormatting("*", "*", "texto em itálico");
  
  const formatBulletList = () => {
    const lines = value.split('\n');
    const start = textareaRef?.selectionStart || 0;
    const lineIndex = value.substring(0, start).split('\n').length - 1;
    
    if (lines[lineIndex]?.startsWith('- ')) {
      // Remove bullet
      lines[lineIndex] = lines[lineIndex].substring(2);
    } else {
      // Add bullet
      lines[lineIndex] = '- ' + (lines[lineIndex] || '');
    }
    
    onChange(lines.join('\n'));
  };

  const formatNumberedList = () => {
    const lines = value.split('\n');
    const start = textareaRef?.selectionStart || 0;
    const lineIndex = value.substring(0, start).split('\n').length - 1;
    
    if (lines[lineIndex]?.match(/^\d+\. /)) {
      // Remove number
      lines[lineIndex] = lines[lineIndex].replace(/^\d+\. /, '');
    } else {
      // Add number (find next number in sequence)
      let number = 1;
      for (let i = lineIndex - 1; i >= 0; i--) {
        const match = lines[i]?.match(/^(\d+)\. /);
        if (match) {
          number = parseInt(match[1]) + 1;
          break;
        }
      }
      lines[lineIndex] = `${number}. ` + (lines[lineIndex] || '');
    }
    
    onChange(lines.join('\n'));
  };

  const formatQuote = () => insertFormatting("> ", "", "citação");
  
  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertAtCursor(prefix);
  };

  const insertLink = () => {
    insertFormatting("[", "](https://exemplo.com)", "texto do link");
  };

  const insertSeparator = () => {
    insertAtCursor('\n---\n');
  };

  return (
    <div className="space-y-2">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pré-visualizar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="space-y-2">
          <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBold}
              className="h-8 px-2"
              title="Negrito (**texto**)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatItalic}
              className="h-8 px-2"
              title="Itálico (*texto*)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border mx-1 self-center" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertHeading(1)}
              className="h-8 px-2 text-xs font-bold"
              title="Título Grande (# texto)"
            >
              H1
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertHeading(2)}
              className="h-8 px-2 text-xs font-bold"
              title="Título Médio (## texto)"
            >
              H2
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertHeading(3)}
              className="h-8 px-2 text-xs font-bold"
              title="Título Pequeno (### texto)"
            >
              H3
            </Button>
            
            <div className="h-6 w-px bg-border mx-1 self-center" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBulletList}
              className="h-8 px-2"
              title="Lista com marcadores (- item)"
            >
              <List className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatNumberedList}
              className="h-8 px-2"
              title="Lista numerada (1. item)"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatQuote}
              className="h-8 px-2"
              title="Citação (> texto)"
            >
              <Quote className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border mx-1 self-center" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className="h-8 px-2 text-xs"
              title="Link ([texto](url))"
            >
              Link
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertSeparator}
              className="h-8 px-2 text-xs"
              title="Separador (---)"
            >
              ---
            </Button>
          </div>
          
          <Textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm resize-vertical min-h-[150px]"
          />
          
          <div className="text-xs text-muted-foreground">
            <p>Formatação: **negrito**, *itálico*, # títulos, - listas, 1. numeradas, {'>'}citações, [links](url), --- separadores</p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-2">
          <div className="min-h-[150px] p-4 border rounded-md bg-card">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-muted-foreground text-sm">Nada para pré-visualizar. Escreva algo no editor.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}