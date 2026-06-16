/**
 * RelevanceScorer — Calcula um score de relevância (0-100) para cada notícia.
 * 
 * Combina múltiplos fatores para determinar a "importância" de uma notícia:
 * - Nível de impacto (do gerador)
 * - Sentimento (urgente pesa mais)
 * - Presença de entidades conhecidas (notícias sobre big techs são mais relevantes)
 * - Frescor do conteúdo (keywords temporais indicam atualidade)
 * 
 * Este score pode ser usado pelo frontend para ordenar/destacar notícias.
 */
import { RawNews } from '../generators/news-generator.interface';
import { ExtractedEntities } from './entity.extractor';

export class RelevanceScorer {
  // Empresas com alto peso de relevância
  private highProfileEntities = new Set([
    'openai', 'google', 'microsoft', 'apple', 'nvidia', 'meta',
    'tesla', 'spacex', 'anthropic', 'amazon',
  ]);

  // Palavras que indicam frescor/atualidade
  private freshnessKeywords = [
    'acaba de', 'nesta semana', 'hoje', 'agora', 'acabou de',
    'primeira vez', 'recém', 'inédito', 'novo recorde', 'breaking',
  ];

  calculate(
    news: RawNews,
    entities: ExtractedEntities,
    sentimentConfidence: number,
  ): number {
    let score = 0;

    // 1. Base score pelo nível de impacto (0-30)
    const impactScores: Record<string, number> = {
      critical: 30,
      high: 22,
      medium: 15,
      low: 8,
    };
    score += impactScores[news.metadata?.impactLevel || 'medium'] || 15;

    // 2. Boost por sentimento urgente/controverso (0-20)
    const sentimentBoosts: Record<string, number> = {
      urgent: 20,
      controversial: 15,
      negative: 10,
      positive: 5,
      neutral: 0,
    };
    score += sentimentBoosts[news.metadata?.sentiment || 'neutral'] || 0;

    // 3. Boost por entidades de alto perfil (0-20)
    const allEntities = [...entities.companies, ...entities.people].map(e => e.toLowerCase());
    const highProfileMatches = allEntities.filter(e => this.highProfileEntities.has(e)).length;
    score += Math.min(20, highProfileMatches * 7);

    // 4. Boost por frescor do conteúdo (0-15)
    const text = (news.title + ' ' + news.content).toLowerCase();
    const freshnessHits = this.freshnessKeywords.filter(k => text.includes(k)).length;
    score += Math.min(15, freshnessHits * 5);

    // 5. Confiança do sentimento como multiplicador (0-15)
    score += Math.round(sentimentConfidence * 15);

    // Normaliza para 0-100
    return Math.min(100, Math.max(0, score));
  }
}
