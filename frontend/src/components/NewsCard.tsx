import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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
  layout?: 'overlay' | 'grid' | 'horizontal';
}

export function NewsCard({ news, layout = 'grid' }: NewsCardProps) {
  const navigate = useNavigate();
  const formattedDate = format(parseISO(news.publishedAt), "dd 'de' MMM, HH:mm", { locale: ptBR });

  // Map de categorias para keywords para garantir imagens relevantes no LoremFlickr
  const imageKeywordMap: Record<string, string> = {
    'inteligencia-artificial': 'ai,robot',
    'cloud-computing': 'cloud,server',
    'ciberseguranca': 'hacker,security',
    'programacao': 'code,developer',
    'hardware': 'hardware,cpu',
    'startups': 'startup,business',
    'blockchain': 'crypto,blockchain',
    'ciencia-espaco': 'space,science',
  };

  const keyword = news.category ? imageKeywordMap[news.category.slug] : 'technology';
  const imageUrl = `https://loremflickr.com/800/600/${keyword}?random=${news.id}`;

  const handleOpen = () => navigate(`/news/${news.id}`);

  // LAYOUT 1: Overlay (Imagem grande com texto escurecido em cima)
  if (layout === 'overlay') {
    return (
      <Card 
        className="group relative overflow-hidden flex flex-col justify-end transition-all hover:shadow-lg cursor-pointer h-full min-h-[400px] border-none rounded-2xl"
        onClick={handleOpen}
      >
        <div className="absolute inset-0 bg-slate-200 z-0"></div>
        <img 
          src={imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Overlay Escuro Inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-20"></div>
        
        {news.category && (
          <div className="absolute top-6 left-6 z-30">
            <Badge variant="default" className="bg-[#004b87] text-white hover:bg-[#003865] border-none font-medium px-3 py-1">
              {news.category.name}
            </Badge>
          </div>
        )}

        <div className="relative z-30 p-6 md:p-8">
          <h2 className="font-extrabold text-white text-3xl md:text-5xl leading-tight mb-3 group-hover:text-blue-200 transition-colors">
            {news.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-slate-300 pt-2">
            <span className="font-semibold text-blue-300">{news.source}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </Card>
    );
  }

  // LAYOUT 2: Horizontal (Imagem na esquerda, texto na direita - estilo feed)
  if (layout === 'horizontal') {
    return (
      <Card 
        className="group overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-md cursor-pointer border border-slate-200 bg-white rounded-2xl"
        onClick={handleOpen}
      >
        <div className="relative w-full sm:w-[240px] h-48 sm:h-auto overflow-hidden bg-slate-100 shrink-0">
          <img 
            src={imageUrl} 
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        
        <div className="flex flex-col flex-grow p-5 sm:p-5 sm:pl-6 justify-between">
          <div>
            {news.category && (
              <Badge variant="default" className="mb-3 bg-[#004b87]/10 text-[#004b87] hover:bg-[#004b87]/20 border-none font-semibold">
                {news.category.name}
              </Badge>
            )}
            <h2 className="font-bold text-slate-900 text-xl leading-tight group-hover:text-[#004b87] transition-colors mb-2">
              {news.title}
            </h2>
            <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
              {news.summary}
            </p>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100/50">
            <span className="font-semibold text-[#004b87]">{news.source}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </Card>
    );
  }

  // LAYOUT 3: Grid Padrão (Imagem em cima, texto embaixo)
  return (
    <Card 
      className="group overflow-hidden flex flex-col justify-between transition-all hover:shadow-md cursor-pointer border border-slate-200 bg-white h-full rounded-2xl"
      onClick={handleOpen}
    >
      <div className="relative w-full h-48 overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {news.category && (
          <div className="absolute top-3 left-3 z-30">
            <Badge variant="default" className="bg-[#004b87] text-white hover:bg-[#003865] border-none shadow-sm">
              {news.category.name}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-5 pb-2">
        <h2 className="font-bold leading-tight text-lg text-slate-900 group-hover:text-[#004b87] transition-colors line-clamp-3">
          {news.title}
        </h2>
      </CardHeader>

      <CardContent className="px-5 flex-grow">
        <p className="text-slate-600 line-clamp-2 text-sm mt-1 leading-relaxed">
          {news.summary}
        </p>
      </CardContent>

      <CardFooter className="px-5 py-4 flex justify-between items-center text-xs text-slate-500 mt-auto border-t border-slate-100">
        <span className="font-semibold text-[#004b87]">{news.source}</span>
        <span>{formattedDate}</span>
      </CardFooter>
    </Card>
  );
}
