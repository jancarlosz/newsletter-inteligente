/**
 * KeywordClassifier — Classificador de categorias por análise de keywords.
 * 
 * Utiliza um sistema de keywords ponderadas para determinar a categoria
 * mais adequada para cada notícia. Suporta "category hints" dos geradores
 * como tiebreaker quando a classificação por keywords é ambígua.
 */
import { RawNews } from '../generators/news-generator.interface';

export interface ProcessedNews {
  title: string;
  content: string;
  source: string;
  categorySlug: string;
  /** Metadados enriquecidos pelo pipeline de processamento */
  metadata?: {
    sentiment?: string;
    impactLevel?: string;
    relevanceScore?: number;
    entities?: string[];
  };
}

export class KeywordClassifier {
  // Keywords com peso para classificação mais precisa
  private categoryKeywords: Record<string, { keywords: string[]; weight: number }[]> = {
    'inteligencia-artificial': [
      { keywords: ['inteligência artificial', 'ia generativa', 'machine learning', 'deep learning'], weight: 3 },
      { keywords: ['openai', 'gpt', 'llm', 'modelo de linguagem', 'redes neurais', 'transformer'], weight: 2 },
      { keywords: ['automação', 'chatbot', 'copilot', 'gemini', 'claude'], weight: 1 },
    ],
    'cloud-computing': [
      { keywords: ['cloud', 'nuvem', 'aws', 'azure', 'gcp'], weight: 3 },
      { keywords: ['serverless', 'kubernetes', 'docker', 'microserviços', 'containers'], weight: 2 },
      { keywords: ['saas', 'paas', 'iaas', 'lambda', 'edge functions'], weight: 1 },
    ],
    'ciberseguranca': [
      { keywords: ['vazamento', 'cibersegurança', 'ransomware', 'zero-day', 'exploit'], weight: 3 },
      { keywords: ['hack', 'brecha', 'vulnerabilidade', 'malware', 'phishing'], weight: 2 },
      { keywords: ['criptografia', 'zero trust', 'firewall', 'soc', 'siem', 'patch'], weight: 1 },
    ],
    'programacao': [
      { keywords: ['programação', 'framework', 'devops', 'ci/cd', 'devsecops'], weight: 3 },
      { keywords: ['typescript', 'python', 'rust', 'react', 'node.js'], weight: 2 },
      { keywords: ['código', 'deploy', 'api', 'desenvolvimento', 'ferramenta'], weight: 1 },
    ],
    'hardware': [
      { keywords: ['hardware', 'processador', 'gpu', 'chip', 'nvidia'], weight: 3 },
      { keywords: ['smartphone', 'iot', 'sensor', 'dispositivo', 'wearable'], weight: 2 },
      { keywords: ['edge computing', '5g', '6g', 'ar', 'vr', 'headset'], weight: 1 },
    ],
    'startups': [
      { keywords: ['startup', 'aporte', 'investimento', 'rodada', 'série'], weight: 3 },
      { keywords: ['unicórnio', 'ipo', 'venture capital', 'fundraising', 'valuation'], weight: 2 },
      { keywords: ['mercado', 'expansão', 'fintech', 'aceleradora'], weight: 1 },
    ],
    'blockchain': [
      { keywords: ['blockchain', 'cripto', 'bitcoin', 'ethereum', 'web3'], weight: 3 },
      { keywords: ['defi', 'nft', 'tokenização', 'smart contract', 'descentralização'], weight: 2 },
      { keywords: ['token', 'mineração', 'dao', 'metaverso', 'wallet'], weight: 1 },
    ],
    'ciencia-espaco': [
      { keywords: ['espacial', 'espaço', 'nasa', 'spacex', 'satélite'], weight: 3 },
      { keywords: ['quântica', 'biotecnologia', 'genética', 'fusão nuclear'], weight: 2 },
      { keywords: ['ciência', 'pesquisa', 'nature', 'science', 'laboratório'], weight: 1 },
    ],
  };

  classify(news: RawNews): ProcessedNews {
    const textToAnalyze = (news.title + ' ' + news.content).toLowerCase();
    let bestMatch = 'programacao';
    let maxScore = 0;

    for (const [slug, weightedGroups] of Object.entries(this.categoryKeywords)) {
      let categoryScore = 0;

      for (const group of weightedGroups) {
        for (const keyword of group.keywords) {
          if (textToAnalyze.includes(keyword)) {
            categoryScore += group.weight;
          }
        }
      }

      if (categoryScore > maxScore) {
        maxScore = categoryScore;
        bestMatch = slug;
      }
    }

    // Se o gerador forneceu um "category hint" e a classificação foi fraca, usa o hint
    if (news.metadata?.categoryHint && maxScore < 3) {
      bestMatch = news.metadata.categoryHint;
    }

    return {
      title: news.title,
      content: news.content,
      source: news.source,
      categorySlug: bestMatch,
      metadata: {
        sentiment: news.metadata?.sentiment,
        impactLevel: news.metadata?.impactLevel,
        relevanceScore: news.metadata?.relevanceScore,
        entities: news.metadata?.entities,
      },
    };
  }
}
