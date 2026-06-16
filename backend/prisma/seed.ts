/**
 * Seed: Popula o banco com as categorias iniciais de notícias.
 * Executar com: npx prisma db seed
 *
 * As categorias são fixas e definidas por nós — o agente curador
 * classifica cada notícia em uma delas usando análise de texto.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'IA',
    slug: 'inteligencia-artificial',
    description:
      'Machine Learning, Deep Learning, LLMs, automação inteligente e tendências em IA.',
  },
  {
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description:
      'AWS, Azure, GCP, Kubernetes, serverless e infraestrutura em nuvem.',
  },
  {
    name: 'Cibersegurança',
    slug: 'ciberseguranca',
    description:
      'Ameaças, vazamentos de dados, criptografia, zero trust e segurança da informação.',
  },
  {
    name: 'Dev & Software',
    slug: 'programacao',
    description:
      'Novas linguagens, frameworks, ferramentas de dev, DevOps e engenharia de software.',
  },
  {
    name: 'Hardware e Dispositivos',
    slug: 'hardware',
    description:
      'Processadores, GPUs, smartphones, IoT, AR/VR e inovações físicas.',
  },
  {
    name: 'Startups e Negócios',
    slug: 'startups',
    description:
      'Rodadas de investimento, unicórnios, fusões, aquisições e mercado de tech.',
  },
  {
    name: 'Blockchain e Web3',
    slug: 'blockchain',
    description:
      'Criptomoedas, DeFi, NFTs, contratos inteligentes e o futuro descentralizado.',
  },
  {
    name: 'Ciência e Espaço',
    slug: 'ciencia-espaco',
    description:
      'Inovações científicas, biotecnologia, exploração espacial e física quântica.',
  },
];

async function main() {
  console.log('Iniciando seed do banco de dados...');

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    console.log(`✅ Categoria gerada/atualizada: ${category.name}`);
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
