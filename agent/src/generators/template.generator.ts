import { NewsGenerator, RawNews } from './news-generator.interface';

export class TemplateGenerator implements NewsGenerator {
  private templates = [
    'A empresa {empresa} acaba de anunciar o lançamento de sua nova ferramenta de {tecnologia}. A novidade promete revolucionar o mercado com recursos como {beneficio}. O CEO declarou que isso mudará a forma como trabalhamos em {ano}.',
    'Vazamento massivo afeta a {empresa}, expondo dados críticos ligados a {tecnologia}. Especialistas alertam que a falta de {beneficio} causou a vulnerabilidade neste {ano}.',
    'Startup brasileira que utiliza {tecnologia} recebe aporte milionário para expandir na América Latina. O foco é focar em {beneficio} para democratizar o acesso até o final de {ano}.',
  ];

  private empresas = ['TechCorp', 'OpenAI', 'Microsoft', 'Google', 'CyberSec BR', 'Nvidia'];
  private tecnologias = ['Inteligência Artificial Generativa', 'Computação Quântica', 'Criptografia Zero Trust', 'Blockchain', 'IoT'];
  private beneficios = ['automação extrema', 'segurança inviolável', 'escalabilidade em nuvem', 'descentralização financeira', 'processamento em tempo real'];

  private getRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async generate(): Promise<RawNews[]> {
    const amountToGenerate = Math.floor(Math.random() * 3) + 1; // Gera de 1 a 3 notícias
    const news: RawNews[] = [];

    for (let i = 0; i < amountToGenerate; i++) {
      let content = this.getRandom(this.templates)
        .replace('{empresa}', this.getRandom(this.empresas))
        .replace('{tecnologia}', this.getRandom(this.tecnologias))
        .replace('{beneficio}', this.getRandom(this.beneficios))
        .replace('{ano}', new Date().getFullYear().toString());

      news.push({
        title: `Novidade no mercado envolvendo ${this.getRandom(this.tecnologias)}`,
        content,
        source: 'TemplateGenerator',
      });
    }

    return news;
  }
}
