import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Preferences() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Busca todas as categorias
    apiFetch('/categories')
      .then(setCategories)
      .catch(console.error);

    // Busca as preferências atuais do usuário
    apiFetch('/users/me/preferences')
      .then((data: Category[]) => {
        setSelectedSlugs(data.map((c) => c.slug));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (slug: string) => {
    setSelectedSlugs((prev) => 
      prev.includes(slug) 
        ? prev.filter((s) => s !== slug) 
        : [...prev, slug]
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await apiFetch('/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify({ categories: selectedSlugs }),
      });
      alert('Preferências salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Card className="bg-background/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl">Suas Preferências</CardTitle>
          <CardDescription>
            Personalize seu feed. Selecione os assuntos que você deseja acompanhar na sua newsletter inteligente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mt-4">
                {categories.map((cat) => {
                  const isSelected = selectedSlugs.includes(cat.slug);
                  return (
                    <Badge
                      key={cat.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer text-sm py-2 px-4 flex items-center gap-2 transition-all hover:scale-105"
                      onClick={() => toggleCategory(cat.slug)}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {cat.name}
                    </Badge>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-end">
                <Button onClick={savePreferences} disabled={saving} size="lg">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Preferências
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
