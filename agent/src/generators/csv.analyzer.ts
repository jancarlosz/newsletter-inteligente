import { NewsGenerator, RawNews } from './news-generator.interface';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

export class CsvAnalyzer implements NewsGenerator {
  async generate(): Promise<RawNews[]> {
    const csvFilePath = path.join(__dirname, '../../data/trends.csv');
    const news: RawNews[] = [];

    if (!fs.existsSync(csvFilePath)) {
      return []; // Se não existir, retorna vazio
    }

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Seleciona um trend aleatório do CSV
          if (results.length === 0) {
            resolve([]);
            return;
          }

          const trend = results[Math.floor(Math.random() * results.length)];
          
          news.push({
            title: `Tendência: ${trend.topic}`,
            content: `A mais nova tendência global, chamada ${trend.topic}, está apresentando um crescimento de ${trend.growth_rate} este ano. Analistas indicam que o setor focado em ${trend.description} receberá grandes investimentos nos próximos meses.`,
            source: 'CsvAnalyzer',
          });

          resolve(news);
        })
        .on('error', (error) => reject(error));
    });
  }
}
