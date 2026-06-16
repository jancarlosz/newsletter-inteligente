import { newsWorker } from './worker';

console.log('🎧 Serviço Consumidor inicializado.');
console.log('Aguardando notícias na fila "newsQueue"...');

// Mantém o processo rodando e limpa na saída
process.on('SIGINT', async () => {
  console.log('Encerrando consumidor...');
  await newsWorker.close();
  process.exit(0);
});
