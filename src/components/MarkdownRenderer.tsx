interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const renderMarkdown = (text: string) => {
    // Split by lines to process each line
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      let processedLine = line;
      
      // Process bold (**text**)
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Process italic (*text*)
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Process lists
      if (line.trim().startsWith('- ')) {
        elements.push(
          <li key={index} dangerouslySetInnerHTML={{ __html: processedLine.replace(/^- /, '') }} />
        );
        return;
      }
      
      // Process numbered lists
      if (line.trim().match(/^\d+\. /)) {
        elements.push(
          <li key={index} dangerouslySetInnerHTML={{ __html: processedLine.replace(/^\d+\. /, '') }} />
        );
        return;
      }
      
      // Process quotes
      if (line.trim().startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
            <span dangerouslySetInnerHTML={{ __html: processedLine.replace(/^> /, '') }} />
          </blockquote>
        );
        return;
      }
      
      // Regular paragraphs (skip empty lines)
      if (line.trim()) {
        elements.push(
          <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      } else {
        elements.push(<br key={index} />);
      }
    });
    
    // Group consecutive list items
    const groupedElements: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
    let listType: 'ul' | 'ol' | null = null;
    
    elements.forEach((element, index) => {
      if (element.type === 'li') {
        // Determine if it's ordered or unordered based on original text
        const originalLine = lines[parseInt(element.key as string)];
        const isOrdered = originalLine?.trim().match(/^\d+\. /);
        const newListType = isOrdered ? 'ol' : 'ul';
        
        if (listType !== newListType && currentList.length > 0) {
          // Close previous list
          groupedElements.push(
            listType === 'ul' 
              ? <ul key={`list-${groupedElements.length}`} className="list-disc list-inside space-y-1 ml-4">{currentList}</ul>
              : <ol key={`list-${groupedElements.length}`} className="list-decimal list-inside space-y-1 ml-4">{currentList}</ol>
          );
          currentList = [];
        }
        
        listType = newListType;
        currentList.push(element);
      } else {
        // Close current list if exists
        if (currentList.length > 0) {
          groupedElements.push(
            listType === 'ul' 
              ? <ul key={`list-${groupedElements.length}`} className="list-disc list-inside space-y-1 ml-4">{currentList}</ul>
              : <ol key={`list-${groupedElements.length}`} className="list-decimal list-inside space-y-1 ml-4">{currentList}</ol>
          );
          currentList = [];
          listType = null;
        }
        
        groupedElements.push(element);
      }
    });
    
    // Close final list if exists
    if (currentList.length > 0) {
      groupedElements.push(
        listType === 'ul' 
          ? <ul key={`list-${groupedElements.length}`} className="list-disc list-inside space-y-1 ml-4">{currentList}</ul>
          : <ol key={`list-${groupedElements.length}`} className="list-decimal list-inside space-y-1 ml-4">{currentList}</ol>
      );
    }
    
    return groupedElements;
  };

  return (
    <div className={`prose prose-sm max-w-none space-y-3 ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}