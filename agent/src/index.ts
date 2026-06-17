/**
 * ─────────────────────────────────────────────────────────────────────
 * AGENTE CURADOR DE CONTEÚDO — Orquestrador Principal
 * ─────────────────────────────────────────────────────────────────────
 * 
 * Serviço autônomo (worker) que roda em background e executa um pipeline
 * completo de curadoria de notícias a cada 10 minutos via cron job.
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    PIPELINE DO AGENTE                           │
 * │                                                                 │
 * │  1. GERAÇÃO ──► 2. CLASSIFICAÇÃO ──► 3. SENTIMENTO             │
 * │                                          │                      │
 * │  6. PUBLICAÇÃO ◄── 5. SCORE ◄── 4. ENTIDADES                  │
 * │     (BullMQ)                                                    │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Etapas do pipeline:
 * 1. GERAÇÃO: Múltiplas estratégias (Strategy Pattern) produzem notícias brutas
 * 2. CLASSIFICAÇÃO: KeywordClassifier determina a categoria por NLP
 * 3. SENTIMENTO: SentimentAnalyzer avalia o tom da notícia
 * 4. ENTIDADES: EntityExtractor identifica empresas, techs e pessoas
 * 5. SCORE: RelevanceScorer calcula a importância (0-100)
 * 6. PUBLICAÇÃO: Envia para fila BullMQ para processamento assíncrono
 * 
 * Padrões de projeto utilizados:
 * - Strategy Pattern: para os geradores (TemplateGenerator, CsvAnalyzer)
 * - Pipeline Pattern: processamento em etapas sequenciais
 * - Dependency Injection (manual): processadores são injetados no orquestrador
 * 
 * @see generators/ — Implementações das estratégias de geração
 * @see processors/ — Processadores NLP do pipeline
 * @see queue/      — Produtor BullMQ para mensageria assíncrona
 */
import { CronJob } from 'cron';
import { TemplateGenerator } from './generators/template.generator';
import { CsvAnalyzer } from './generators/csv.analyzer';
import { KeywordClassifier } from './processors/keyword.classifier';
import { SentimentAnalyzer } from './processors/sentiment.analyzer';
import { EntityExtractor } from './processors/entity.extractor';
import { RelevanceScorer } from './processors/relevance.scorer';
import { NewsProducer } from './queue/producer';
import { NewsGenerator } from './generators/news-generator.interface';
import * as dotenv from 'dotenv';
dotenv.config();

// ─── Inicialização dos componentes do pipeline ───────────────────────
const producer = new NewsProducer();
const classifier = new KeywordClassifier();
const sentimentAnalyzer = new SentimentAnalyzer();
const entityExtractor = new EntityExtractor();
const relevanceScorer = new RelevanceScorer();

// ─── Estratégias de geração (Strategy Pattern) ──────────────────────
// Novas estratégias podem ser adicionadas aqui sem modificar o resto
// do código — princípio Open/Closed do SOLID.
const generators: NewsGenerator[] = [
  new TemplateGenerator(),
  new CsvAnalyzer(),
];

// ─── Controle de deduplicação ────────────────────────────────────────
// Evita publicar notícias com títulos muito semelhantes na mesma execução
const recentTitles = new Set<string>();
const MAX_RECENT_TITLES = 200;

function isDuplicate(title: string): boolean {
  const normalized = title.toLowerCase().replace(/[^a-záàãéêíóôõú0-9]/g, '');
  if (recentTitles.has(normalized)) return true;
  recentTitles.add(normalized);
  // Limpa cache se ficar muito grande
  if (recentTitles.size > MAX_RECENT_TITLES) {
    const entries = [...recentTitles];
    entries.slice(0, 50).forEach(e => recentTitles.delete(e));
  }
  return false;
}

// ─── Pipeline principal ──────────────────────────────────────────────
async function runAgent() {
  const startTime = Date.now();
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 AGENTE CURADOR — Iniciando ciclo de curadoria');
  console.log('═'.repeat(60));
  console.log(`⏰ ${new Date().toLocaleString('pt-BR')}`);

  let totalGenerated = 0;
  let totalPublished = 0;
  let totalSkipped = 0;

  for (const generator of generators) {
    console.log(`\n📦 Executando estratégia: ${generator.name}`);
    
    try {
      // ETAPA 1: Geração
      const rawNewsList = await generator.generate();
      console.log(`   └─ ${rawNewsList.length} notícia(s) gerada(s)`);
      totalGenerated += rawNewsList.length;

      for (const rawNews of rawNewsList) {
        // Deduplicação
        if (isDuplicate(rawNews.title)) {
          console.log(`   ⏭️  Duplicada (ignorada): ${rawNews.title.substring(0, 50)}...`);
          totalSkipped++;
          continue;
        }

        // ETAPA 2: Classificação por categoria
        const classified = classifier.classify(rawNews);

        // ETAPA 3: Análise de sentimento
        const sentiment = sentimentAnalyzer.analyze(rawNews);

        // ETAPA 4: Extração de entidades
        const entities = entityExtractor.extract(rawNews);

        // ETAPA 5: Score de relevância
        const relevanceScore = relevanceScorer.calculate(rawNews, entities, sentiment.confidence);

        // Enriquece os metadados finais
        classified.metadata = {
          ...classified.metadata,
          sentiment: sentiment.sentiment,
          relevanceScore,
          entities: [
            ...entities.companies.slice(0, 3),
            ...entities.technologies.slice(0, 3),
          ],
        };

        // Log detalhado do processamento
        const sentimentEmoji: Record<string, string> = {
          positive: '😊', negative: '😟', neutral: '😐',
          controversial: '🔥', urgent: '🚨',
        };
        
        console.log(`   ┌─ 📰 "${classified.title.substring(0, 60)}..."`);
        console.log(`   ├─ 📂 Categoria: ${classified.categorySlug}`);
        console.log(`   ├─ ${sentimentEmoji[sentiment.sentiment] || '❓'} Sentimento: ${sentiment.sentiment} (confiança: ${(sentiment.confidence * 100).toFixed(0)}%)`);
        console.log(`   ├─ ⭐ Relevância: ${relevanceScore}/100`);
        if (entities.companies.length > 0) {
          console.log(`   ├─ 🏢 Empresas: ${entities.companies.join(', ')}`);
        }
        if (entities.technologies.length > 0) {
          console.log(`   ├─ 💻 Tecnologias: ${entities.technologies.join(', ')}`);
        }

        // ETAPA 6: Publicação na fila
        await producer.publish(classified);
        console.log(`   └─ ✅ Publicado na fila!`);
        totalPublished++;
      }
    } catch (error) {
      console.error(`   └─ ❌ Erro no gerador ${generator.name}:`, error);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '─'.repeat(60));
  console.log(`📊 RESUMO DO CICLO:`);
  console.log(`   Geradas: ${totalGenerated} | Publicadas: ${totalPublished} | Ignoradas: ${totalSkipped}`);
  console.log(`   Tempo total: ${elapsed}s`);
  console.log('─'.repeat(60) + '\n');
}

// ─── Inicialização e Cron ────────────────────────────────────────────
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         AGENTE CURADOR DE CONTEÚDO — v2.0              ║');
console.log('║                                                        ║');
console.log('║  Pipeline: Geração → Classificação → Sentimento →     ║');
console.log('║            Entidades → Relevância → Publicação        ║');
console.log('║                                                        ║');
console.log('║  Estratégias: TemplateGenerator, CsvAnalyzer           ║');
console.log('║  Processadores: KeywordClassifier, SentimentAnalyzer,  ║');
console.log('║                 EntityExtractor, RelevanceScorer       ║');
console.log('║  Cron: a cada 10 minutos                               ║');
console.log('╚══════════════════════════════════════════════════════════╝');

// Executa imediatamente na inicialização
runAgent();

// Configura cron para rodar a cada 10 minutos
const job = new CronJob('*/10 * * * *', async () => {
  await runAgent();
});

job.start();
console.log('⏰ Cron job ativo: próximo ciclo em 10 minutos.\n');
