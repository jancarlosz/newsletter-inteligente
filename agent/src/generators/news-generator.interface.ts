export interface RawNews {
  title: string;
  content: string;
  source: string;
}

/**
 * Interface Strategy para geração de notícias.
 * Permite plugar diferentes formas de captar notícias (Templates, CSV, Web Scraping, etc.)
 */
export interface NewsGenerator {
  generate(): Promise<RawNews[]>;
}
