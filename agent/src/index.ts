import { CronJob } from 'cron';
import { TemplateGenerator } from './generators/template.generator';
import { CsvAnalyzer } from './generators/csv.analyzer';
import { KeywordClassifier } from './processors/keyword.classifier';
import { NewsProducer } from './queue/producer';
import { NewsGenerator } from './generators/news-generator.interface';
import * as dotenv from 'dotenv';
dotenv.config();

const producer = new NewsProducer();
const classifier = new KeywordClassifier();

// Nossas estratégias de geração
const generators: NewsGenerator[] = [
  new TemplateGenerator(),
  new CsvAnalyzer(),
];

async function runAgent() {
  console.log('🤖 Agente Curador rodando...');
  
  for (const generator of generators) {
    try {
      const rawNewsList = await generator.generate();
      
      for (const rawNews of rawNewsList) {
        // 1. Classifica a notícia
        const processedNews = classifier.classify(rawNews);
        // 2. Envia para a fila
        await producer.publish(processedNews);
      }
    } catch (error) {
      console.error(`❌ Erro em um dos geradores:`, error);
    }
  }
}

// Inicia imediatamente ao rodar e depois fica agendado a cada 30 minutos
console.log('⏳ Inicializando Agente Curador...');
runAgent();

const job = new CronJob('0,30 * * * *', async () => {
  await runAgent();
});

job.start();
console.log('⏰ Cron configurado para rodar a cada 30 minutos.');
