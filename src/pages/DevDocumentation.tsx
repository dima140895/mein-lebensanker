import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateDevDocumentation, downloadDevDocumentation } from '@/lib/generateDevDocumentation';
import ReactMarkdown from 'react-markdown';

const DevDocumentation: React.FC = () => {
  const markdown = useMemo(() => generateDevDocumentation(), []);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Zurück</span>
          </Link>
          <Button onClick={downloadDevDocumentation} className="gap-2">
            <Download className="h-4 w-4" />
            Als Markdown herunterladen
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Entwickler-Dokumentation</h1>
              <p className="text-sm text-muted-foreground">Technische Architektur, Sicherheit & Quellcode-Referenz</p>
            </div>
          </div>

          <article className="prose prose-sm md:prose-base max-w-none dark:prose-invert
            prose-headings:text-foreground prose-p:text-foreground/90
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-table:border prose-th:bg-muted prose-th:px-3 prose-th:py-2
            prose-td:px-3 prose-td:py-2 prose-td:border-t
            prose-a:text-primary prose-strong:text-foreground
          ">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
};

export default DevDocumentation;
