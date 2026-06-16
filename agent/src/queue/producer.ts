import { Queue } from 'bullmq';
import { ProcessedNews } from '../processors/keyword.classifier';
import * as dotenv from 'dotenv';
dotenv.config();

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export class NewsProducer {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('newsQueue', { connection: connection as any });
  }

  async publish(news: ProcessedNews) {
    // Adiciona a notícia na fila para ser sumarizada pelo consumidor
    await this.queue.add('process-news', news, {
      attempts: 3, // retry 3 vezes em caso de falha da IA
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    console.log(`🚀 Notícia enviada para fila: [${news.categorySlug}] ${news.title}`);
  }
}
