// ============================================
// SEED — Categorías primero, luego tickets
// Ejecutar: pnpm seed
// ============================================
import 'dotenv/config';
import { connectDB, disconnectDB } from './lib/mongoose';
import { Category } from './models/category.model';
import { Ticket } from './models/ticket.model';

async function main(): Promise<void> {
  await connectDB();
  console.log('🌱 Iniciando seed...');

  await Ticket.deleteMany({});
  await Category.deleteMany({});

  const categories = await Category.insertMany([
    { name: 'Red', description: 'Problemas de conectividad, VPN, WiFi' },
    { name: 'Hardware', description: 'Equipos físicos: laptops, impresoras, monitores' },
    { name: 'Software', description: 'Aplicaciones, sistemas operativos, licencias' },
    { name: 'Cuentas', description: 'Usuarios, contraseñas, permisos de acceso' },
    { name: 'Correo', description: 'Outlook, Exchange, sincronización de email' },
  ]);

  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  categories.forEach((c) => console.log(`  ✓ Category: ${c.name}`));

  const tickets = await Ticket.insertMany([
    {
      code: 'TKT-1001',
      title: 'Fallo en conexión VPN',
      description: 'El usuario no logra conectarse a la VPN corporativa desde casa.',
      status: 'open',
      priority: 'high',
      estimatedHours: 2,
      agentId: 'AGT-10',
      category: byName['Red'],
    },
    {
      code: 'TKT-1002',
      title: 'Impresora de red no responde',
      description: 'La impresora del piso 3 no imprime desde ningún equipo.',
      status: 'in_progress',
      priority: 'medium',
      estimatedHours: 1.5,
      agentId: 'AGT-12',
      category: byName['Hardware'],
    },
    {
      code: 'TKT-1003',
      title: 'Correo no sincroniza en el celular',
      description: 'El usuario no recibe correos nuevos en la app móvil de Outlook.',
      status: 'open',
      priority: 'low',
      estimatedHours: 1,
      category: byName['Correo'],
    },
    {
      code: 'TKT-1004',
      title: 'Laptop muy lenta al iniciar',
      description: 'El equipo tarda más de 5 minutos en estar listo para trabajar.',
      status: 'closed',
      priority: 'medium',
      estimatedHours: 3,
      agentId: 'AGT-08',
      category: byName['Hardware'],
    },
    {
      code: 'TKT-1005',
      title: 'Solicitud de restablecimiento de contraseña',
      description: 'El usuario olvidó su contraseña de dominio y no puede iniciar sesión.',
      status: 'open',
      priority: 'low',
      estimatedHours: 0.5,
      category: byName['Cuentas'],
    },
    {
      code: 'TKT-1006',
      title: 'Error al instalar Adobe Acrobat',
      description: 'La instalación falla con código de error 1603.',
      status: 'in_progress',
      priority: 'medium',
      estimatedHours: 1.5,
      agentId: 'AGT-15',
      category: byName['Software'],
    },
  ]);

  tickets.forEach((t) => console.log(`  ✓ Ticket: ${t.code} — ${t.title}`));
  console.log('✅ Seed completado.');
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
