"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsWorker = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const ai_summarizer_1 = require("./ai-summarizer");
const news_saver_1 = require("./news-saver");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '../.env' });
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new ioredis_1.default(REDIS_URL, {
    maxRetriesPerRequest: null,
});
const summarizer = new ai_summarizer_1.AiSummarizer();
const saver = new news_saver_1.NewsSaver();
exports.newsWorker = new bullmq_1.Worker('newsQueue', async (job) => {
    console.log(`\n📥 Processando Job [${job.id}] - ${job.data.title}`);
    try {
        // 1. Sumariza com Gemini
        console.log('🤖 Solicitando resumo ao Gemini...');
        const summary = await summarizer.summarize(job.data.title, job.data.content);
        // 2. Salva no Banco via Prisma
        console.log('💾 Salvando no banco de dados...');
        await saver.save(job.data.title, summary, job.data.source, job.data.categorySlug);
    }
    catch (error) {
        console.error(`❌ Erro ao processar Job [${job.id}]:`, error);
        throw error; // Repassa para o BullMQ fazer o retry
    }
}, { connection });
exports.newsWorker.on('completed', (job) => {
    console.log(`✅ Job [${job.id}] concluído com sucesso!`);
});
exports.newsWorker.on('failed', (job, err) => {
    console.error(`🚨 Job [${job?.id}] falhou com o erro: ${err.message}`);
});
//# sourceMappingURL=worker.js.map