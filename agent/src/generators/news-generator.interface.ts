/**
 * Interface base do padrão Strategy para geração de notícias.
 * 
 * Cada gerador implementa esta interface, permitindo plugar diferentes
 * formas de captar notícias (Templates, CSV, APIs externas, Web Scraping, etc.)
 * sem modificar o código existente — princípio Open/Closed do SOLID.
 */
export interface RawNews {
  title: string;
  content: string;
  source: string;
  /** Metadados opcionais para enriquecer a notícia durante o pipeline */
  metadata?: {
    sentiment?: 'positive' | 'negative' | 'neutral' | 'controversial' | 'urgent';
    impactLevel?: 'low' | 'medium' | 'high' | 'critical';
    relevanceScore?: number;       // 0-100
    entities?: string[];           // Empresas, pessoas, tecnologias detectadas
    categoryHint?: string;         // Slug sugerido pelo gerador (pode ser sobrescrito pelo classificador)
    sourceReference?: string;      // Fonte original da informação
  };
}

export interface NewsGenerator {
  /** Nome legível do gerador para logs e debug */
  readonly name: string;
  generate(): Promise<RawNews[]>;
}
