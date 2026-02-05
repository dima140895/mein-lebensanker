import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Image, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import all Instagram assets
import promo01 from '@/assets/instagram/promo-01-main.jpg';
import promo02 from '@/assets/instagram/promo-02-family.jpg';
import promo03 from '@/assets/instagram/promo-03-security.jpg';
import promo04 from '@/assets/instagram/promo-04-testimonial.jpg';
import promo05 from '@/assets/instagram/promo-05-features.jpg';
import carousel01 from '@/assets/instagram/carousel-01-step1.jpg';
import carousel02 from '@/assets/instagram/carousel-02-step2.jpg';
import carousel03 from '@/assets/instagram/carousel-03-step3.jpg';
import story01 from '@/assets/instagram/story-01-cta.jpg';
import story02 from '@/assets/instagram/story-02-poll.jpg';
import story03 from '@/assets/instagram/story-03-countdown.jpg';

const assets = [
  { name: 'promo-01-main.jpg', src: promo01, category: 'Feed-Post', description: 'Hauptpost mit Anker' },
  { name: 'promo-02-family.jpg', src: promo02, category: 'Feed-Post', description: 'Familien-Thema' },
  { name: 'promo-03-security.jpg', src: promo03, category: 'Feed-Post', description: 'Sicherheit' },
  { name: 'promo-04-testimonial.jpg', src: promo04, category: 'Feed-Post', description: 'Testimonial' },
  { name: 'promo-05-features.jpg', src: promo05, category: 'Feed-Post', description: 'Features' },
  { name: 'carousel-01-step1.jpg', src: carousel01, category: 'Carousel', description: 'Schritt 1' },
  { name: 'carousel-02-step2.jpg', src: carousel02, category: 'Carousel', description: 'Schritt 2' },
  { name: 'carousel-03-step3.jpg', src: carousel03, category: 'Carousel', description: 'Schritt 3' },
  { name: 'story-01-cta.jpg', src: story01, category: 'Story', description: 'Call-to-Action' },
  { name: 'story-02-poll.jpg', src: story02, category: 'Story', description: 'Umfrage' },
  { name: 'story-03-countdown.jpg', src: story03, category: 'Story', description: 'Countdown' },
];

const InstagramDownload = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadImage = async (src: string, filename: string) => {
    setDownloading(filename);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
    setDownloading(null);
  };

  const downloadAll = async () => {
    for (const asset of assets) {
      await downloadImage(asset.src, asset.name);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
    }
  };

  const feedPosts = assets.filter(a => a.category === 'Feed-Post');
  const carouselPosts = assets.filter(a => a.category === 'Carousel');
  const stories = assets.filter(a => a.category === 'Story');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Instagram Content Download</h1>
            <p className="text-muted-foreground">Alle Assets für Deinen Content-Kalender</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button onClick={downloadAll} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Alle herunterladen ({assets.length} Dateien)
          </Button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="w-5 h-5" />
              Content-Kalender (Markdown)
            </Button>
          </a>
        </div>

        {/* Feed Posts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Feed-Posts (1080x1080)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {feedPosts.map((asset) => (
                <div key={asset.name} className="group relative">
                  <img 
                    src={asset.src} 
                    alt={asset.description}
                    className="w-full aspect-square object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs text-center mb-2">{asset.description}</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => downloadImage(asset.src, asset.name)}
                      disabled={downloading === asset.name}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {downloading === asset.name ? '...' : 'Download'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carousel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Carousel-Slides (1080x1080)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {carouselPosts.map((asset) => (
                <div key={asset.name} className="group relative">
                  <img 
                    src={asset.src} 
                    alt={asset.description}
                    className="w-full aspect-square object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs text-center mb-2">{asset.description}</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => downloadImage(asset.src, asset.name)}
                      disabled={downloading === asset.name}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {downloading === asset.name ? '...' : 'Download'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Stories (1080x1920)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              {stories.map((asset) => (
                <div key={asset.name} className="group relative">
                  <img 
                    src={asset.src} 
                    alt={asset.description}
                    className="w-full aspect-[9/16] object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs text-center mb-2">{asset.description}</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => downloadImage(asset.src, asset.name)}
                      disabled={downloading === asset.name}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {downloading === asset.name ? '...' : 'Download'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Calendar Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content-Kalender (4 Wochen)
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="bg-muted p-4 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">📅 Woche 1: Einführung</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mo: Feed-Post (promo-01-main)</li>
                <li>Mi: Story Poll (story-02-poll)</li>
                <li>Fr: Feed-Post (promo-02-family)</li>
              </ul>
              
              <h4 className="font-semibold mt-4 mb-2">📅 Woche 2: Features</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mo: Carousel (3 Slides)</li>
                <li>Mi: Story CTA (story-01-cta)</li>
                <li>Fr: Feed-Post (promo-05-features)</li>
              </ul>
              
              <h4 className="font-semibold mt-4 mb-2">📅 Woche 3: Sicherheit</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mo: Feed-Post (promo-03-security)</li>
                <li>Mi: Story Countdown (story-03-countdown)</li>
                <li>Fr: Feed-Post (promo-04-testimonial)</li>
              </ul>
              
              <h4 className="font-semibold mt-4 mb-2">📅 Woche 4: Community</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mo: Reel/Video</li>
                <li>Mi: Story Frage</li>
                <li>Fr: Teilen-Post</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramDownload;
