import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [period, setPeriod] = useState<string>('todos'); // todos, hoje, semana, mes
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Categories for Filter
  useEffect(() => {
    apiFetch('/categories')
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch News based on filters
  useEffect(() => {
    setLoading(true);
    let url = `/news?page=${page}&limit=7`; // 7 porque 1 featured + 6 grid

    if (selectedCategory) url += `&categoryId=${selectedCategory}`;
    if (period !== 'todos') url += `&period=${period}`;

    apiFetch(url)
      .then((data) => {
        setNews(data.data);
        setTotalPages(data.meta.totalPages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, selectedCategory, period]);

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? '' : catId);
    setPage(1); // reset pagination
  };

  return (
    <main className="container py-8">
      {/* Header / Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Últimas Notícias</h1>
          <p className="text-muted-foreground mt-1">Sua curadoria diária de tecnologia.</p>
        </div>

        {/* Filtro por Período */}
        <div className="w-full md:w-48">
          <Select value={period} onValueChange={(val) => { setPeriod(val); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo o tempo</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro por Categoria (Scroll horizontal) */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
        <Badge
          variant={selectedCategory === '' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-sm px-4 py-1"
          onClick={() => handleCategoryClick('')}
        >
          Todas
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap text-sm px-4 py-1"
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Grid de Notícias */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <h3 className="text-xl font-medium text-muted-foreground">Nenhuma notícia encontrada para este filtro.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard 
              key={item.id} 
              news={item} 
              featured={index === 0 && page === 1} // Apenas a primeira da página 1 é Destaque (col-span-2)
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 gap-4">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </main>
  );
}
