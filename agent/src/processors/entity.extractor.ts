/**
 * EntityExtractor — Processador de extração de entidades nomeadas (NER).
 * 
 * Identifica empresas, tecnologias, pessoas e localizações mencionadas
 * no texto usando um dicionário de entidades conhecidas + heurísticas
 * de detecção por padrões (palavras que começam com maiúscula, etc.)
 * 
 * Implementação high-code sem dependências de ML externas.
 */
import { RawNews } from '../generators/news-generator.interface';

export interface ExtractedEntities {
  companies: string[];
  technologies: string[];
  people: string[];
  locations: string[];
}

export class EntityExtractor {
  // ─── Dicionários de entidades conhecidas ───────────────────────────
  private knownCompanies = new Set([
    'google', 'apple', 'microsoft', 'meta', 'amazon', 'nvidia', 'tesla',
    'openai', 'anthropic', 'mistral', 'hugging face', 'deepmind',
    'crowdstrike', 'cloudflare', 'spacex', 'ibm', 'oracle', 'intel',
    'samsung', 'cisco', 'adobe', 'salesforce', 'netflix', 'spotify',
    'uber', 'airbnb', 'stripe', 'palantir', 'databricks', 'snowflake',
    'ifood', 'nubank', 'stone', 'totvs', 'vtex', 'c6 bank',
    'walmart', 'nestlé', 'blackrock', 'jp morgan',
    'aws', 'gcp', 'azure',
  ]);

  private knownTechnologies = new Set([
    'inteligência artificial', 'machine learning', 'deep learning', 'ia generativa',
    'blockchain', 'web3', 'defi', 'nft', 'smart contracts',
    'computação quântica', 'edge computing', 'cloud computing', 'serverless',
    'kubernetes', 'docker', 'microserviços', 'api rest',
    'zero trust', 'criptografia', 'ransomware', 'zero-day',
    'iot', 'ar', 'vr', 'realidade mista', 'computação espacial',
    '5g', '6g', 'redes neurais', 'llm', 'gpt', 'transformer',
    'devops', 'devsecops', 'ci/cd', 'terraform',
    'react', 'typescript', 'python', 'rust', 'go',
    'digital twins', 'biohacking', 'robótica',
  ]);

  private knownPeople = new Set([
    'elon musk', 'sam altman', 'satya nadella', 'tim cook',
    'mark zuckerberg', 'sundar pichai', 'jensen huang',
    'dario amodei', 'linus torvalds', 'yann lecun',
  ]);

  extract(news: RawNews): ExtractedEntities {
    const text = (news.title + ' ' + news.content).toLowerCase();
    const originalText = news.title + ' ' + news.content;

    const companies: Set<string> = new Set();
    const technologies: Set<string> = new Set();
    const people: Set<string> = new Set();
    const locations: Set<string> = new Set();

    // 1. Match contra dicionários conhecidos
    for (const company of this.knownCompanies) {
      if (text.includes(company)) {
        companies.add(this.capitalize(company));
      }
    }

    for (const tech of this.knownTechnologies) {
      if (text.includes(tech)) {
        technologies.add(this.capitalize(tech));
      }
    }

    for (const person of this.knownPeople) {
      if (text.includes(person)) {
        people.add(this.capitalize(person));
      }
    }

    // 2. Heurística: detecta possíveis entidades não-dicionarizadas
    //    Palavras com 2+ tokens consecutivos em CamelCase/Title Case
    const titleCasePattern = /(?:[A-Z][a-záàãéêíóôõú]+(?:\s(?:de|da|do|e|para|em|no|na|com)\s)?){2,}/g;
    const matches = originalText.match(titleCasePattern) || [];
    for (const match of matches) {
      const trimmed = match.trim();
      if (trimmed.length > 4 && !['Este Mês', 'Esta Semana', 'Todo Tempo'].includes(trimmed)) {
        // Se parece nome de empresa (não está nos techs)
        if (!this.knownTechnologies.has(trimmed.toLowerCase())) {
          companies.add(trimmed);
        }
      }
    }

    // 3. Merge com metadados do gerador (se disponíveis)
    if (news.metadata?.entities) {
      for (const entity of news.metadata.entities) {
        const lower = entity.toLowerCase();
        if (this.knownCompanies.has(lower)) {
          companies.add(this.capitalize(lower));
        } else if (this.knownTechnologies.has(lower)) {
          technologies.add(this.capitalize(lower));
        } else {
          // Se não está em nenhum dicionário, classifica como tech (default)
          technologies.add(entity);
        }
      }
    }

    return {
      companies: [...companies].slice(0, 5),
      technologies: [...technologies].slice(0, 5),
      people: [...people].slice(0, 3),
      locations: [...locations].slice(0, 3),
    };
  }

  private capitalize(str: string): string {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
