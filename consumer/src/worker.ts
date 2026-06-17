import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { AiSummarizer } from './ai-summarizer';
import { NewsSaver } from './news-saver';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const summarizer = new AiSummarizer();
const saver = new NewsSaver();

export const newsWorker = new Worker(
  'newsQueue',
  async (job: Job) => {
    console.log(`\n📥 Processando Job [${job.id}] - ${job.data.title}`);

    try {
      // 1. Sumariza com Gemini
      console.log('🤖 Solicitando resumo ao Gemini...');
      const summary = await summarizer.summarize(job.data.title, job.data.content);

      // 2. Salva no Banco via Prisma
      console.log('💾 Salvando no banco de dados...');
      await saver.save(
        job.data.title,
        summary,
        job.data.content,
        job.data.source,
        job.data.categorySlug
      );
    } catch (error) {
      console.error(`❌ Erro ao processar Job [${job.id}]:`, error);
      throw error; // Repassa para o BullMQ fazer o retry
    }
  },
  { connection: connection as any, concurrency: 3 }
);

newsWorker.on('completed', (job) => {
  console.log(`✅ Job [${job.id}] concluído com sucesso!`);
});

newsWorker.on('failed', (job, err) => {
  console.error(`🚨 Job [${job?.id}] falhou com o erro: ${err.message}`);
});
