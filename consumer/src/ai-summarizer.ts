import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export class AiSummarizer {
  async summarize(rawTitle: string, rawContent: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Você é um curador de notícias profissional. Reescreva a notícia abaixo de forma envolvente,
      clara e direta ao ponto, como se fosse uma newsletter de tecnologia premium.
      
      Título Original: ${rawTitle}
      Conteúdo Original: ${rawContent}
      
      Regras:
      1. Crie um título cativante na primeira linha (não use a palavra "Título:").
      2. Pule uma linha.
      3. Escreva um resumo de 2 a 3 parágrafos curtos.
      4. O tom deve ser moderno e informativo.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      // Fallback em caso de erro da IA (para a fila não travar infinitamente)
      return `${rawTitle}\n\n${rawContent}`;
    }
  }
}
