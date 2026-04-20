import { db } from './index';
import { products, users } from './schema';
import { hashPassword } from '../auth';

async function seed() {
  console.log('🌱 Começando o seed do banco de dados...');

  // Seed de Usuário
  try {
    const userEmail = 'jeanfire.fg@gmail.com';
    const hashedPassword = await hashPassword('123');
    await db.insert(users).values({
      email: userEmail,
      passwordHash: hashedPassword,
      onboardingCompleted: true,
    }).onConflictDoNothing();
    console.log(`👤 Usuário criado: ${userEmail}`);
  } catch (error) {
    console.error('❌ Erro ao criar usuário no seed:', error);
  }

  // Seed de Produtos (price em centavos; image_url para cards no chat)
  const sampleProducts = [
    {
      name: 'iPhone 15 Pro',
      description: 'O iPhone mais poderoso com chip A17 Pro e corpo em titânio.',
      price: 599900,
      stock: 50,
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a45484a8131?w=400&q=80',
    },
    {
      name: 'MacBook Air M2',
      description: 'Superfino, super-rápido e com tela Liquid Retina de 13,6 polegadas.',
      price: 799900,
      stock: 25,
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Os melhores fones de ouvido com cancelamento de ruído do mercado.',
      price: 189900,
      stock: 40,
      brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1618366533997-6ed8cdeba0ce?w=400&q=80',
    },
    {
      name: 'PlayStation 5',
      description: 'Experiência de jogo incrível com SSD ultra-rápido e suporte a Ray Tracing.',
      price: 349900,
      stock: 15,
      brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1606813907299-d86efa9b94be?w=400&q=80',
    },
    {
      name: 'Kindle Paperwhite',
      description: 'Agora com tela de 6,8 polegadas e temperatura de luz ajustável.',
      price: 69900,
      stock: 100,
      brand: 'Amazon',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'O smartphone com IA integrada e câmera de 200MP.',
      price: 649900,
      stock: 30,
      brand: 'Samsung',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
    },
    {
      name: 'Nintendo Switch OLED',
      description: 'Console híbrido com tela vibrante de 7 polegadas.',
      price: 229900,
      stock: 20,
      brand: 'Nintendo',
      imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6beac93c3?w=400&q=80',
    },
  ];

  try {
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log(`✅ Produto criado: ${product.name}`);
    }
    console.log('✨ Seed finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
