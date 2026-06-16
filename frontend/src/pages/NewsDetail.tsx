import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Loader2, ArrowLeft, Calendar, Share2, Bookmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../components/ui/badge';

interface NewsDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: string;
  category: {
    name: string;
    slug: string;
  };
}

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

export function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/news/${id}`)
      .then((data) => setNews(data))
      .catch((err) => {
        console.error(err);
        navigate('/'); // Redireciona se não encontrar
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center bg-[#f4f6f8]">
        <Loader2 className="w-12 h-12 animate-spin text-[#004b87]" />
      </div>
    );
  }

  if (!news) return null;

  const formattedDate = format(parseISO(news.publishedAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
  const keyword = news.category ? imageKeywordMap[news.category.slug] : 'technology';
  const imageUrl = `https://loremflickr.com/1200/600/${keyword}?random=${news.id}`;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Imagem de Capa (Hero) */}
      <div className="w-full h-[40vh] md:h-[50vh] relative bg-slate-900">
        <img 
          src={imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 w-full">
          <div className="container max-w-4xl pb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-6 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md w-fit">
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Home
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#004b87] text-white hover:bg-[#003865] border-none text-sm px-3 py-1">
                {news.category?.name}
              </Badge>
              <span className="text-blue-300 font-semibold text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                {news.source}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {news.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Notícia */}
      <main className="container max-w-4xl py-12">
        <div className="bg-[#f8fafc] border-l-4 border-[#004b87] p-6 mb-10 rounded-r-xl">
          <p className="text-xl text-slate-700 italic leading-relaxed font-medium">
            "{news.summary}"
          </p>
        </div>

        <article className="prose prose-lg prose-slate max-w-none">
          {/* Renderiza o conteúdo que foi gerado pelo agente */}
          {news.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-slate-800 leading-relaxed text-lg mb-6">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors">
              <Bookmark className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
