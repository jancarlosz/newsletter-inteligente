/**
 * TemplateGenerator — Estratégia de geração por composição de templates.
 * 
 * Combina templates narrativos parametrizados com pools de dados dinâmicos
 * (empresas reais, tecnologias, métricas) para produzir notícias fictícias
 * que simulam artigos de portais como TechCrunch e The Verge.
 * 
 * Cada notícia gerada inclui metadados de sentimento e entidades extraídas,
 * demonstrando capacidade de NLP mesmo sem dependências externas.
 */
import { NewsGenerator, RawNews } from './news-generator.interface';

export class TemplateGenerator implements NewsGenerator {
  readonly name = 'Newsletter AI';

  // ─── Templates narrativos parametrizados ───────────────────────────
  // Cada template simula um estilo jornalístico diferente
  private templates = {
    launch: [
      'A {empresa} acaba de revelar sua mais nova aposta em {tecnologia}: uma plataforma que promete {beneficio}. Segundo o CEO da companhia, o produto já está em fase de testes com parceiros estratégicos e deve chegar ao mercado geral no segundo semestre de {ano}. Analistas do setor apontam que a movimentação pode redefinir padrões no segmento de {setor}.',
      '{empresa} surpreende o mercado ao anunciar {tecnologia} integrada aos seus serviços. A novidade, que utiliza {beneficio}, já está disponível em versão beta para desenvolvedores selecionados. O mercado reagiu positivamente — as ações da empresa subiram {percentual}% no pré-mercado.',
      'Em um evento global transmitido para mais de 50 países, a {empresa} apresentou sua estratégia de {tecnologia}. O destaque foi a demonstração ao vivo de {beneficio}, algo que especialistas consideravam impossível até o ano passado.',
    ],
    security: [
      'Vazamento crítico na {empresa} expõe {quantidade} milhões de registros ligados a {tecnologia}. Investigadores independentes apontam que a brecha existia há meses e foi explorada por grupos APT vinculados a ataques anteriores. A empresa já ativou protocolos de {beneficio} e notificou autoridades reguladoras.',
      'Pesquisadores de segurança da {empresa} descobriram uma vulnerabilidade zero-day em sistemas de {tecnologia} amplamente utilizados por bancos e governos. O patch de emergência já foi liberado, mas estima-se que {quantidade} mil sistemas permaneçam expostos.',
      'Relatório anual da {empresa} revela que ataques ransomware cresceram {percentual}% em {ano}, com foco especial em infraestrutura de {tecnologia}. A recomendação é migrar urgentemente para arquiteturas de {beneficio}.',
    ],
    investment: [
      'Startup brasileira focada em {tecnologia} acaba de levantar R$ {quantidade} milhões em rodada Série B liderada pela {empresa}. O aporte será direcionado para expandir operações na América Latina e investir em {beneficio}. É o maior investimento do setor no país em {ano}.',
      'A {empresa} lidera consórcio de investimento de US$ {quantidade} milhões em {tecnologia}. O grupo pretende acelerar a adoção de {beneficio} no mercado corporativo, com foco em empresas do setor financeiro e saúde.',
    ],
    research: [
      'Estudo publicado na revista Nature revela que {tecnologia} pode {beneficio} com eficiência {percentual}% superior às soluções atuais. A pesquisa, conduzida em parceria entre {empresa} e universidades brasileiras, foi validada por pares internacionais e abre caminho para aplicações comerciais já em {ano}.',
      'Cientistas da {empresa} conseguiram pela primeira vez demonstrar {beneficio} utilizando {tecnologia} em escala comercial. A descoberta, publicada nesta semana, é considerada um dos maiores avanços tecnológicos da década.',
    ],
  };

  // ─── Pools de dados dinâmicos ──────────────────────────────────────
  private empresas = ['OpenAI', 'Google DeepMind', 'Microsoft', 'Meta AI', 'Nvidia', 'Apple', 'Amazon AWS', 'Tesla', 'CrowdStrike', 'Cloudflare', 'Anthropic', 'Mistral AI', 'Hugging Face', 'SpaceX', 'IBM Research'];
  
  private tecnologias = [
    { nome: 'Inteligência Artificial Generativa', setor: 'IA e Machine Learning' },
    { nome: 'Computação Quântica', setor: 'computação avançada' },
    { nome: 'Criptografia Pós-Quântica', setor: 'cibersegurança' },
    { nome: 'Blockchain de Terceira Geração', setor: 'Web3 e finanças descentralizadas' },
    { nome: 'Redes Neurais Multimodais', setor: 'IA e processamento de dados' },
    { nome: 'Edge AI', setor: 'IoT e dispositivos inteligentes' },
    { nome: 'Computação Espacial', setor: 'realidade estendida' },
    { nome: 'DevSecOps automatizado', setor: 'engenharia de software' },
    { nome: 'Digital Twins', setor: 'simulação industrial' },
    { nome: 'Serverless Computing', setor: 'cloud computing' },
  ];

  private beneficios = [
    'reduzir custos operacionais em até 60%',
    'processar dados em tempo real com latência inferior a 1ms',
    'garantir segurança zero-knowledge sem comprometer a usabilidade',
    'democratizar o acesso a modelos de IA para pequenas empresas',
    'automatizar processos que antes exigiam equipes de 50+ pessoas',
    'gerar código funcional a partir de especificações em linguagem natural',
    'detectar ameaças cibernéticas antes mesmo delas serem executadas',
    'tokenizar ativos reais com liquidez instantânea',
    'rodar modelos de 7 bilhões de parâmetros em smartphones comuns',
    'simular cenários complexos com precisão de 99.7%',
  ];

  private getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async generate(): Promise<RawNews[]> {
    const amountToGenerate = this.getRandomInt(2, 4);
    const news: RawNews[] = [];
    const usedTemplateTypes = new Set<string>();

    for (let i = 0; i < amountToGenerate; i++) {
      // Garante variedade: tenta usar um tipo de template diferente a cada iteração
      const templateTypes = Object.keys(this.templates) as (keyof typeof this.templates)[];
      let type = this.getRandom(templateTypes);
      if (usedTemplateTypes.has(type) && usedTemplateTypes.size < templateTypes.length) {
        type = templateTypes.find(t => !usedTemplateTypes.has(t)) || type;
      }
      usedTemplateTypes.add(type);

      const templateList = this.templates[type];
      const template = this.getRandom(templateList);
      const empresa = this.getRandom(this.empresas);
      const tech = this.getRandom(this.tecnologias);
      const beneficio = this.getRandom(this.beneficios);

      const content = template
        .replace('{empresa}', empresa)
        .replace('{empresa}', empresa) // Pode aparecer 2x no template
        .replace('{tecnologia}', tech.nome)
        .replace('{tecnologia}', tech.nome)
        .replace('{beneficio}', beneficio)
        .replace('{beneficio}', beneficio)
        .replace('{setor}', tech.setor)
        .replace('{ano}', new Date().getFullYear().toString())
        .replace('{percentual}', this.getRandomInt(15, 85).toString())
        .replace('{quantidade}', this.getRandomInt(5, 500).toString());

      // Gera título que varia por tipo de notícia
      const titles: Record<string, string[]> = {
        launch: [
          `${empresa} lança nova plataforma de ${tech.nome}`,
          `${tech.nome}: ${empresa} revela produto que promete ${beneficio.split(' ').slice(0, 4).join(' ')}`,
          `Exclusivo: ${empresa} aposta alto em ${tech.nome} para ${new Date().getFullYear()}`,
        ],
        security: [
          `Alerta: falha crítica em ${tech.nome} afeta milhões de usuários`,
          `${empresa} é alvo de ataque cibernético envolvendo ${tech.nome}`,
          `Vulnerabilidade zero-day em ${tech.nome} preocupa especialistas`,
        ],
        investment: [
          `Startup de ${tech.nome} recebe aporte milionário liderado por ${empresa}`,
          `${empresa} investe pesado em ${tech.nome} visando mercado latino-americano`,
          `Rodada bilionária: ${tech.nome} atrai gigantes do venture capital`,
        ],
        research: [
          `Descoberta científica: ${tech.nome} supera barreiras consideradas impossíveis`,
          `${empresa} publica estudo revolucionário sobre ${tech.nome}`,
          `Avanço em ${tech.nome} pode transformar ${tech.setor} para sempre`,
        ],
      };

      const title = this.getRandom(titles[type] || titles.launch);

      // ─── Metadados enriquecidos ──────────────────────────────────
      const sentimentMap: Record<string, RawNews['metadata']> = {
        launch: { sentiment: 'positive', impactLevel: 'high' },
        security: { sentiment: 'urgent', impactLevel: 'critical' },
        investment: { sentiment: 'positive', impactLevel: 'medium' },
        research: { sentiment: 'positive', impactLevel: 'high' },
      };

      news.push({
        title,
        content,
        source: this.name,
        metadata: {
          ...sentimentMap[type],
          entities: [empresa, tech.nome, tech.setor],
          relevanceScore: this.getRandomInt(50, 100),
        },
      });
    }

    return news;
  }
}
