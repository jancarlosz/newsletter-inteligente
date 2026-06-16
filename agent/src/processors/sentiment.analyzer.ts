/**
 * SentimentAnalyzer — Processador de Linguagem Natural (NLP) high-code.
 * 
 * Analisa o conteúdo textual de uma notícia e determina o sentimento
 * predominante usando um léxico de palavras-chave ponderadas.
 * 
 * Esta é uma implementação "from scratch" sem dependências de ML externas,
 * demonstrando domínio em NLP básico e text processing.
 */
import { RawNews } from '../generators/news-generator.interface';

type Sentiment = 'positive' | 'negative' | 'neutral' | 'controversial' | 'urgent';

interface SentimentResult {
  sentiment: Sentiment;
  confidence: number;  // 0.0 a 1.0
  positiveScore: number;
  negativeScore: number;
  urgentScore: number;
}

export class SentimentAnalyzer {
  // Léxico ponderado para análise de sentimento em português
  private positiveLexicon: Record<string, number> = {
    'revolucionar': 3, 'inovação': 2, 'inovador': 2, 'crescimento': 2,
    'avanço': 3, 'sucesso': 3, 'recorde': 3, 'democratizar': 2,
    'surpreende': 2, 'positivamente': 2, 'oportunidade': 2, 'lançamento': 1,
    'investimento': 2, 'expansão': 2, 'aporte': 2, 'eficiência': 2,
    'progresso': 2, 'melhoria': 2, 'líder': 1, 'primeiro': 2,
    'descoberta': 3, 'conquista': 2, 'otimismo': 2, 'promissor': 2,
    'lucrativo': 2, 'econômico': 1, 'escalável': 2, 'sustentável': 2,
  };

  private negativeLexicon: Record<string, number> = {
    'vazamento': -3, 'ataque': -3, 'vulnerabilidade': -3, 'brecha': -3,
    'falha': -2, 'expõe': -2, 'risco': -2, 'crise': -3,
    'queda': -2, 'perda': -2, 'colapso': -3, 'fraude': -3,
    'hack': -3, 'ransomware': -3, 'exploit': -3, 'malware': -3,
    'prejuízo': -2, 'demissão': -2, 'encerramento': -2, 'proibição': -2,
    'multa': -2, 'processo': -1, 'investigação': -1, 'escândalo': -3,
  };

  private urgentLexicon: Record<string, number> = {
    'urgente': 4, 'crítico': 4, 'emergência': 4, 'alerta': 3,
    'imediato': 3, 'zero-day': 4, 'patch': 2, 'migrar': 2,
    'obrigatório': 3, 'corrida': 2, 'prazo': 2, 'antes que': 3,
  };

  analyze(news: RawNews): SentimentResult {
    const text = (news.title + ' ' + news.content).toLowerCase();
    const words = text.split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;
    let urgentScore = 0;
    let matchedWords = 0;

    for (const word of words) {
      // Remove pontuação para matching
      const clean = word.replace(/[.,;:!?"()]/g, '');

      if (this.positiveLexicon[clean]) {
        positiveScore += this.positiveLexicon[clean];
        matchedWords++;
      }
      if (this.negativeLexicon[clean]) {
        negativeScore += Math.abs(this.negativeLexicon[clean]);
        matchedWords++;
      }
      if (this.urgentLexicon[clean]) {
        urgentScore += this.urgentLexicon[clean];
        matchedWords++;
      }
    }

    // Também checa frases compostas (bigramas)
    for (const [phrase, score] of Object.entries(this.urgentLexicon)) {
      if (phrase.includes(' ') && text.includes(phrase)) {
        urgentScore += score;
        matchedWords++;
      }
    }

    // Determina sentimento com base nos scores
    const totalScore = positiveScore + negativeScore + urgentScore;
    const confidence = totalScore > 0 ? Math.min(1, matchedWords / 10) : 0;

    let sentiment: Sentiment;

    if (urgentScore > 6) {
      sentiment = 'urgent';
    } else if (positiveScore > 0 && negativeScore > 0 && Math.abs(positiveScore - negativeScore) < 3) {
      sentiment = 'controversial';
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
    } else if (positiveScore > negativeScore) {
      sentiment = 'positive';
    } else {
      sentiment = 'neutral';
    }

    // Se o gerador já sugeriu um sentimento, usa como tiebreaker
    if (news.metadata?.sentiment && confidence < 0.5) {
      sentiment = news.metadata.sentiment;
    }

    return { sentiment, confidence, positiveScore, negativeScore, urgentScore };
  }
}
