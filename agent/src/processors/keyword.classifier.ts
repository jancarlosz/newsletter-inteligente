import { RawNews } from '../generators/news-generator.interface';

export interface ProcessedNews extends RawNews {
  categorySlug: string;
}

export class KeywordClassifier {
  private categoryKeywords = {
    'inteligencia-artificial': ['inteligência artificial', 'ia', 'generativa', 'machine learning', 'openai'],
    'cloud-computing': ['nuvem', 'cloud', 'aws', 'azure', 'serverless'],
    'ciberseguranca': ['vazamento', 'dados', 'segurança', 'cibersegurança', 'criptografia', 'zero trust', 'hacker'],
    'programacao': ['ferramenta', 'programação', 'framework', 'desenvolvimento', 'devops'],
    'hardware': ['hardware', 'processadores', 'gpus', 'nvidia', 'dispositivos', 'iot'],
    'startups': ['startup', 'aporte', 'milionário', 'unicórnio', 'mercado', 'investimento'],
    'blockchain': ['blockchain', 'cripto', 'descentralização', 'web3', 'contratos inteligentes'],
    'ciencia-espaco': ['ciência', 'espaço', 'espacial', 'quântica', 'biotecnologia']
  };

  classify(news: RawNews): ProcessedNews {
    const textToAnalyze = (news.title + ' ' + news.content).toLowerCase();
    let bestMatch = 'programacao'; // Categoria default
    let maxHits = 0;

    for (const [slug, keywords] of Object.entries(this.categoryKeywords)) {
      let hits = 0;
      for (const keyword of keywords) {
        if (textToAnalyze.includes(keyword)) {
          hits++;
        }
      }

      if (hits > maxHits) {
        maxHits = hits;
        bestMatch = slug;
      }
    }

    return {
      ...news,
      categorySlug: bestMatch,
    };
  }
}
