import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Ícones/emojis representando cada categoria para visual premium
const categoryIcons: Record<string, string> = {
  'inteligencia-artificial': '🤖',
  'cloud-computing': '☁️',
  'ciberseguranca': '🛡️',
  'programacao': '💻',
  'hardware': '🔧',
  'startups': '🚀',
  'blockchain': '⛓️',
  'ciencia-espaco': '🔬',
};

export function Preferences() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/categories'),
      apiFetch('/users/me/preferences'),
    ])
      .then(([cats, prefs]) => {
        setCategories(cats);
        setSelectedSlugs(prefs.map((c: Category) => c.slug));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (slug: string) => {
    setSaved(false);
    setSelectedSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify({ categories: selectedSlugs }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-[#f4f6f8]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-2/5 bg-[#004b87] p-16 flex-col justify-center items-start text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-12">
            <img src="/logo-newsletter-branca.png" alt="Newsletter Digital" className="h-10 object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold mb-6 leading-tight">
            Personalize<br />seu feed de notícias
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Selecione as categorias que mais te interessam.
            Seu feed será personalizado para mostrar apenas o que importa para você.
          </p>

          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-blue-300 shrink-0" />
            <p className="text-blue-100 text-sm">
              Quanto mais categorias você selecionar, mais variado será seu feed diário.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Categories Grid */}
      <div className="w-full lg:w-3/5 flex flex-col p-6 sm:p-12 lg:p-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#004b87] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o feed
            </Link>
            <h2 className="text-3xl font-bold text-slate-900">Suas Preferências</h2>
            {user && (
              <p className="text-slate-500 mt-1">
                Olá, <span className="font-semibold text-slate-700">{user.name?.split(' ')[0]}</span>! Escolha os assuntos que te interessam.
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#004b87]" />
          </div>
        ) : (
          <>
            {/* Selected count */}
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-[#004b87] text-white text-sm font-bold rounded-full px-4 py-1.5">
                {selectedSlugs.length} de {categories.length}
              </span>
              <span className="text-sm text-slate-500">categorias selecionadas</span>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {categories.map((cat) => {
                const isSelected = selectedSlugs.includes(cat.slug);
                const icon = categoryIcons[cat.slug] || '📰';

                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`
                      group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left
                      ${isSelected
                        ? 'border-[#004b87] bg-[#004b87]/5 shadow-md shadow-blue-900/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Icon */}
                    <span className="text-2xl shrink-0">{icon}</span>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <span className={`block font-bold text-base ${isSelected ? 'text-[#004b87]' : 'text-slate-800'}`}>
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="block text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {cat.description}
                        </span>
                      )}
                    </div>

                    {/* Checkbox indicator */}
                    <div className={`
                      shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all
                      ${isSelected
                        ? 'bg-[#004b87] text-white scale-100'
                        : 'bg-slate-100 text-transparent group-hover:bg-slate-200 scale-90'
                      }
                    `}>
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Save Button - fixed at bottom on mobile */}
            <div className="sticky bottom-6 flex items-center gap-4">
              <button
                onClick={savePreferences}
                disabled={saving}
                className={`
                  flex-1 h-14 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2
                  shadow-lg shadow-blue-900/20
                  ${saved
                    ? 'bg-green-500 text-white'
                    : 'bg-[#004b87] hover:bg-[#003865] text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {saving ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Preferências salvas!
                  </>
                ) : (
                  'Salvar Preferências'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
