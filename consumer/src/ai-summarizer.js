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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSummarizer = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '../.env' }); // Lê o .env da raiz do monorepo
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
class AiSummarizer {
    async summarize(rawTitle, rawContent) {
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
exports.AiSummarizer = AiSummarizer;
//# sourceMappingURL=ai-summarizer.js.map