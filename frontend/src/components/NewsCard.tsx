import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    category?: {
      name: string;
      slug: string;
    };
  };
  featured?: boolean;
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  const formattedDate = format(parseISO(news.publishedAt), "dd 'de' MMM, HH:mm", { locale: ptBR });

  // Exemplo de imagem baseada na categoria para dar um visual de portal
  // Em um cenário real viria do banco de dados (da IA/Scraping)
  const imageUrl = `https://source.unsplash.com/random/800x600/?${news.category?.slug || 'technology'}`;

  return (
    <Card 
      className={`group overflow-hidden flex flex-col justify-between transition-all hover:shadow-glow cursor-pointer ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      onClick={() => window.open(news.url, '_blank')}
    >
      {/* Imagem de Destaque */}
      <div className={`relative w-full overflow-hidden ${featured ? 'h-64 md:h-96' : 'h-48'}`}>
        {/* Fallback color/gradient caso a imagem falhe, e um placeholder usando gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-0"></div>
        <img 
          src={imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover z-10 opacity-60 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Overlay Escuro para o texto ler bem */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-20"></div>
        
        {/* Badge da Categoria sobre a imagem */}
        {news.category && (
          <div className="absolute top-4 left-4 z-30">
            <Badge variant="default" className="bg-primary/80 backdrop-blur-md">
              {news.category.name}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="relative z-30 -mt-16 sm:-mt-20 px-4 sm:px-6">
        <h2 className={`font-bold leading-tight ${featured ? 'text-2xl sm:text-4xl text-primary' : 'text-xl text-primary'} group-hover:text-accent transition-colors`}>
          {news.title}
        </h2>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 relative z-30 flex-grow">
        <p className="text-muted-foreground line-clamp-3 mt-2">
          {news.summary}
        </p>
      </CardContent>

      <CardFooter className="px-4 sm:px-6 pb-4 relative z-30 flex justify-between items-center text-xs text-muted-foreground mt-4 border-t border-border/50 pt-4">
        <span className="font-medium text-foreground">{news.source}</span>
        <span>{formattedDate}</span>
      </CardFooter>
    </Card>
  );
}
