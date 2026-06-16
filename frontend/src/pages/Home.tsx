import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { NewsCard } from '../components/NewsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Loader2, Calendar, ChevronDown, Filter, Sparkles, Globe } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: {
    name: string;
    slug: string;
  };
}

export function Home() {
  const { isAuthenticated } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [period, setPeriod] = useState<string>(''); // day, week, month
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Feed personalizado
  const [userPreferences, setUserPreferences] = useState<string[]>([]); // slugs das preferências
  const [usePersonalizedFeed, setUsePersonalizedFeed] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || '';

  // Fetch Categories
  useEffect(() => {
    apiFetch('/categories')
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch user preferences when logged in
  useEffect(() => {
    if (isAuthenticated) {
      apiFetch('/users/me/preferences')
        .then((prefs: { slug: string }[]) => {
          const slugs = prefs.map(p => p.slug);
          setUserPreferences(slugs);
          // Ativa feed personalizado automaticamente se o usuário tem preferências
          if (slugs.length > 0) {
            setUsePersonalizedFeed(true);
          }
        })
        .catch(() => setUserPreferences([]));
    } else {
      setUserPreferences([]);
      setUsePersonalizedFeed(false);
    }
  }, [isAuthenticated]);

  // Fetch News based on filters
  useEffect(() => {
    setLoading(true);
    let url = `/news?page=${page}&limit=15`; 

    if (categorySlug) url += `&category=${categorySlug}`;
    if (period && period !== 'todos') url += `&period=${period}`;

    apiFetch(url)
      .then((data) => {
        let items: News[] = data.data;
        // Se feed personalizado ativo e sem filtro manual de categoria, filtra pelas preferências
        if (usePersonalizedFeed && userPreferences.length > 0 && !categorySlug) {
          items = items.filter(n => userPreferences.includes(n.category?.slug));
        }
        setNews(items);
        setTotalPages(data.meta.lastPage);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, categorySlug, period, usePersonalizedFeed, userPreferences]);

  const handleCategoryClick = (catSlug: string) => {
    if (catSlug) {
      setSearchParams({ category: catSlug });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const moreSectionSlugs = ['blockchain', 'ciencia-espaco', 'hardware'];
  const mainCategories = categories.filter(c => !moreSectionSlugs.includes(c.slug));
  const moreCategories = categories.filter(c => moreSectionSlugs.includes(c.slug));

  const topNews = news.slice(0, 6);
  const feedNews = news.slice(6);

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-20">
      <main className="container py-8">

        {/* Banner de Feed Personalizado */}
        {isAuthenticated && userPreferences.length > 0 && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-2xl p-4 px-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              {usePersonalizedFeed ? (
                <Sparkles className="w-5 h-5 text-[#004b87]" />
              ) : (
                <Globe className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-sm font-semibold text-slate-800">
                  {usePersonalizedFeed ? 'Feed Personalizado' : 'Todas as Notícias'}
                </span>
                <span className="text-xs text-slate-500 block">
                  {usePersonalizedFeed 
                    ? `Mostrando apenas: ${userPreferences.map(s => categories.find(c => c.slug === s)?.name).filter(Boolean).join(', ')}` 
                    : 'Exibindo notícias de todas as categorias'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setUsePersonalizedFeed(!usePersonalizedFeed); setPage(1); }}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                  usePersonalizedFeed 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-[#004b87] text-white hover:bg-[#003865]'
                }`}
              >
                {usePersonalizedFeed ? 'Ver Todas' : 'Personalizar'}
              </button>
              <Link
                to="/preferences"
                className="text-xs text-[#004b87] hover:underline font-medium"
              >
                Editar
              </Link>
            </div>
          </div>
        )}
        
        {/* BARRA DE NAVEGAÇÃO SECUNDÁRIA (Filtros) */}
        <div className="bg-white rounded-2xl p-4 px-6 shadow-sm border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
          
          {/* Categorias (Esquerda) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 flex-1">
            <button
              className={`whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-wider transition-colors ${
                categorySlug === '' 
                  ? 'text-[#004b87] border-b-2 border-[#004b87] pb-1' 
                  : 'text-slate-500 hover:text-[#004b87] border-b-2 border-transparent pb-1'
              }`}
              onClick={() => handleCategoryClick('')}
            >
              Todas
            </button>
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                className={`whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-wider transition-colors ${
                  categorySlug === cat.slug 
                    ? 'text-[#004b87] border-b-2 border-[#004b87] pb-1' 
                    : 'text-slate-500 hover:text-[#004b87] border-b-2 border-transparent pb-1'
                }`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name}
              </button>
            ))}

            {/* Dropdown Mais Seções */}
            {moreCategories.length > 0 && (
              <div className="relative group z-40">
                <button className={`flex items-center gap-1 whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-wider transition-colors pb-1 border-b-2 ${
                  moreCategories.some(c => c.slug === categorySlug) 
                    ? 'text-[#004b87] border-[#004b87]' 
                    : 'text-slate-500 border-transparent hover:text-[#004b87]'
                }`}>
                  Mais Seções <ChevronDown className="w-4 h-4"/>
                </button>
                <div className="absolute left-0 top-full mt-0 pt-2 w-56 hidden group-hover:block">
                  <div className="bg-white shadow-xl border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    {moreCategories.map(cat => (
                      <button
                        key={cat.id}
                        className={`text-left px-5 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors ${
                          categorySlug === cat.slug ? 'text-[#004b87] bg-blue-50' : 'text-slate-700'
                        }`}
                        onClick={() => handleCategoryClick(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Período (Direita) */}
          <div className="shrink-0 w-full xl:w-56 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-5 flex justify-end">
            <Select value={period || 'todos'} onValueChange={(val) => { setPeriod(val === 'todos' ? '' : (val || '')); setPage(1); }}>
              <SelectTrigger className="w-full bg-slate-50 border-transparent rounded-xl h-10 px-4 focus:ring-[#004b87]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <SelectValue>
                    {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mês' : 'Todo o tempo'}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} sideOffset={8} className="rounded-xl bg-white shadow-xl border-slate-200 p-1">
                <SelectItem value="todos" className="rounded-lg cursor-pointer">Todo o tempo</SelectItem>
                <SelectItem value="day" className="rounded-lg cursor-pointer">Hoje</SelectItem>
                <SelectItem value="week" className="rounded-lg cursor-pointer">Esta semana</SelectItem>
                <SelectItem value="month" className="rounded-lg cursor-pointer">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="w-12 h-12 animate-spin text-[#004b87]" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-slate-300">
            <Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-700">Nenhuma notícia encontrada</h3>
            <p className="text-slate-500 mt-2">Nenhuma notícia gerada ainda ou correspondente ao filtro atual.</p>
          </div>
        ) : (
          <>

            {/* HERO SECTION - GRADE DE DESTAQUES (Visível apenas se estivermos na página 1 e sem filtros muito restritivos que retornem menos de 4 itens, mas para simplificar mostramos sempre que houver topNews) */}
            {page === 1 && topNews.length > 0 && (
              <section className="mb-12">
                {/* Linha Superior: 1 Gigante + 2 Pequenos Stackados */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                  {/* Manchete Principal (66%) */}
                  <div className="lg:col-span-8">
                    {topNews[0] && <NewsCard news={topNews[0]} layout="overlay" />}
                  </div>
                  
                  {/* Coluna Direita com 2 Destaques Secundários (33%) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex-1">
                      {topNews[1] && <NewsCard news={topNews[1]} layout="grid" />}
                    </div>
                    <div className="flex-1 hidden sm:block">
                      {topNews[2] && <NewsCard news={topNews[2]} layout="grid" />}
                    </div>
                  </div>
                </div>

                {/* Linha Inferior: 3 Destaques Terciários */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topNews[3] && <NewsCard news={topNews[3]} layout="grid" />}
                  {topNews[4] && <NewsCard news={topNews[4]} layout="grid" />}
                  {topNews[5] && <NewsCard news={topNews[5]} layout="grid" />}
                </div>
              </section>
            )}

            {/* DIVISOR */}
            {page === 1 && topNews.length > 0 && (
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap uppercase">
                  <span className="text-[#004b87]">»</span> Últimas Notícias
                </h3>
                <div className="flex-grow h-px bg-slate-200"></div>
              </div>
            )}

            {/* SEÇÃO PRINCIPAL: FEED VERTICAL + SIDEBAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* FEED DE NOTÍCIAS (ESQUERDA - 70%) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {feedNews.length > 0 ? (
                  feedNews.map((item) => (
                    <NewsCard key={item.id} news={item} layout="horizontal" />
                  ))
                ) : page !== 1 ? (
                  <p className="text-slate-500">Não há mais notícias nesta página.</p>
                ) : null}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-4">
                    <Button 
                      variant="outline" 
                      className="bg-white"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm font-medium text-slate-500">Página {page} de {totalPages}</span>
                    <Button 
                      variant="outline" 
                      className="bg-white"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>

              {/* SIDEBAR (DIREITA - 30%) */}
              <aside className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-24 flex flex-col gap-8">

                  {/* WIDGET: Banner Placeholder */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-[#004b87] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                    <div className="relative z-10">
                      <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">Publicidade</span>
                      <h4 className="text-white font-extrabold text-2xl mt-4 mb-2">Assine a Newsletter Premium</h4>
                      <p className="text-slate-400 text-sm mb-6">Receba análises profundas diretamente no seu e-mail.</p>
                      <button className="bg-white text-slate-900 font-bold py-2 px-6 rounded-full w-full hover:bg-blue-50 transition-colors">
                        Assinar Agora
                      </button>
                    </div>
                  </div>

                </div>
              </aside>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
