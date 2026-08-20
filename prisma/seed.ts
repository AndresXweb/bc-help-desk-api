// ============================================
// SEED — Datos demo (idempotente)
// ============================================
// Ejecutar: pnpm dlx prisma db seed
// Se puede correr múltiples veces sin duplicar datos.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Categorías (upsert por name único)
  const categoriesData = [
    { name: 'Red', description: 'Problemas de conectividad, VPN, WiFi' },
    { name: 'Hardware', description: 'Equipos físicos: laptops, impresoras, monitores' },
    { name: 'Software', description: 'Aplicaciones, sistemas operativos, licencias' },
    { name: 'Cuentas', description: 'Usuarios, contraseñas, permisos de acceso' },
    { name: 'Correo', description: 'Outlook, Exchange, sincronización de email' },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
    categories[cat.name] = created.id;
    console.log(`  ✓ Category: ${created.name}`);
  }

  // 2. Tickets — solo insertamos si la tabla está vacía (idempotente)
  const existingCount = await prisma.ticket.count();
  if (existingCount > 0) {
    console.log(`  ⏭ Ya existen ${existingCount} tickets. Omitiendo inserción.`);
  } else {
    const tickets = [
      {
        title: 'Fallo en conexión VPN',
        description: 'El usuario no logra conectarse a la VPN corporativa desde casa.',
        status: 'open',
        priority: 'high',
        estimatedHours: 2,
        agentId: 'AGT-10',
        categoryId: categories['Red'],
      },
      {
        title: 'Impresora de red no responde',
        description: 'La impresora del piso 3 no imprime desde ningún equipo.',
        status: 'in_progress',
        priority: 'medium',
        estimatedHours: 1.5,
        agentId: 'AGT-12',
        categoryId: categories['Hardware'],
      },
      {
        title: 'Correo no sincroniza en el celular',
        description: 'El usuario no recibe correos nuevos en la app móvil de Outlook.',
        status: 'open',
        priority: 'low',
        estimatedHours: 1,
        categoryId: categories['Correo'],
      },
      {
        title: 'Laptop muy lenta al iniciar',
        description: 'El equipo tarda más de 5 minutos en estar listo para trabajar.',
        status: 'closed',
        priority: 'medium',
        estimatedHours: 3,
        agentId: 'AGT-08',
        categoryId: categories['Hardware'],
      },
      {
        title: 'Solicitud de restablecimiento de contraseña',
        description: 'El usuario olvidó su contraseña de dominio y no puede iniciar sesión.',
        status: 'open',
        priority: 'low',
        estimatedHours: 0.5,
        categoryId: categories['Cuentas'],
      },
      {
        title: 'Error al instalar Adobe Acrobat',
        description: 'La instalación falla con código de error 1603.',
        status: 'in_progress',
        priority: 'medium',
        estimatedHours: 1.5,
        agentId: 'AGT-15',
        categoryId: categories['Software'],
      },
    ];

    for (const t of tickets) {
      const created = await prisma.ticket.create({ data: t });
      console.log(`  ✓ Ticket: ${created.title}`);
    }
  }

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
