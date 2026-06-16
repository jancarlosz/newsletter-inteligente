"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("./worker");
console.log('🎧 Serviço Consumidor inicializado.');
console.log('Aguardando notícias na fila "newsQueue"...');
// Mantém o processo rodando e limpa na saída
process.on('SIGINT', async () => {
    console.log('Encerrando consumidor...');
    await worker_1.newsWorker.close();
    process.exit(0);
});
//# sourceMappingURL=index.js.map