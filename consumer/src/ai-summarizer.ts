import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Lê o .env da raiz do monorepo

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY não configurada no .env');
}

const genAI = new GoogleGenerativeAI(apiKey);

export class AiSummarizer {
  async summarize(rawTitle: string, rawContent: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Você é um curador de notícias profissional. Reescreva a notícia abaixo de forma envolvente,
      clara e direta ao ponto, como se fosse uma newsletter de tecnologia premium.
      Mantenha um tom profissional mas acessível. Não adicione informações que não estão no texto original.
      Responda APENAS com o texto final da notícia (sem introduções como "Aqui está").

      Título Original: ${rawTitle}
      Conteúdo Original: ${rawContent}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }
}
