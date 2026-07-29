import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Ticket, ProcessedReport, Resolution, ResolutionTimeSummary } from './types.js';

const DATA_DIR = './data';
const OUTPUT_DIR = './output';
const INPUT_FILE = join(DATA_DIR, 'tickets.json');
const OUTPUT_FILE = join(OUTPUT_DIR, 'report.json');

// Lee el argumento --category de la línea de comandos (ej. pnpm start -- --category CAT-NET)
function parseCategoryArg(argv: string[]): string | null {
    const idx = argv.indexOf('--category');
    if (idx === -1 || !argv[idx + 1]) return null;
    return argv[idx + 1];
}

async function ensureOutputDirectory(): Promise<void> {
    await mkdir(OUTPUT_DIR, { recursive: true });
}

// Calcula horas entre createdAt y resolvedAt para tickets cerrados
function calculateResolutionTime(tickets: Ticket[]): ResolutionTimeSummary {
    const resolved = tickets
        .filter((t) => t.status === 'closed' && t.resolution)
        .map((t) => {
            const createdAt = new Date(t.createdAt).getTime();
            const resolvedAt = new Date(t.resolution!.resolvedAt).getTime();
            const hours = (resolvedAt - createdAt) / (1000 * 60 * 60);
            return { ticketId: t.id, hours };
        });

    if (resolved.length === 0) {
        return { averageHours: null, fastest: null, slowest: null };
    }

    const totalHours = resolved.reduce((sum, r) => sum + r.hours, 0);
    const averageHours = Math.round((totalHours / resolved.length) * 100) / 100;

    const fastest = resolved.reduce((min, r) => (r.hours < min.hours ? r : min));
    const slowest = resolved.reduce((max, r) => (r.hours > max.hours ? r : max));

    return {
        averageHours,
        fastest: { ticketId: fastest.ticketId, hours: Math.round(fastest.hours * 100) / 100 },
        slowest: { ticketId: slowest.ticketId, hours: Math.round(slowest.hours * 100) / 100 },
    };
}

async function processHelpDeskData(): Promise<void> {
    try {
        console.log('Iniciando procesamiento de datos del Help Desk...');
        await ensureOutputDirectory();

        // 1. Lectura asíncrona (I/O no bloqueante)
        const rawData = await readFile(INPUT_FILE, 'utf-8');
        const allTickets: Ticket[] = JSON.parse(rawData);

        // 2. Filtro por categoría (--category)
        const categoryFilter = parseCategoryArg(process.argv.slice(2));
        let tickets = allTickets;

        if (categoryFilter) {
            const availableCategories = [...new Set(allTickets.map((t) => t.categoryId))];
            tickets = allTickets.filter((t) => t.categoryId === categoryFilter);

            if (tickets.length === 0) {
                console.warn(`⚠️  La categoría "${categoryFilter}" no existe o no tiene tickets.`);
                console.warn(`Categorías disponibles: ${availableCategories.join(', ')}`);
            }
        }

        // 3. Transformación de datos
        const report: ProcessedReport = {
            totalTickets: tickets.length,
            closedTickets: tickets.filter((t) => t.status === 'closed').length,
            openTickets: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
            categoryFilter,
            resolutionTime: calculateResolutionTime(tickets),
            resolutions: tickets
                .filter((t) => t.status === 'closed' && t.resolution)
                .map((t) => t.resolution as Resolution),
        };

        // 4. Escritura asíncrona
        await writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf-8');

        // 5. Resumen en consola
        console.log(`Procesamiento exitoso. Reporte guardado en: ${OUTPUT_FILE}`);
        if (categoryFilter) console.log(`Filtro aplicado: categoría "${categoryFilter}"`);
        console.log(`Total tickets: ${report.totalTickets}`);
        console.log(`Cerrados: ${report.closedTickets} · Abiertos/en progreso: ${report.openTickets}`);
        if (report.resolutionTime.averageHours !== null) {
            console.log(`Tiempo promedio de resolución: ${report.resolutionTime.averageHours}h`);
            console.log(`  Más rápido: ${report.resolutionTime.fastest?.ticketId} (${report.resolutionTime.fastest?.hours}h)`);
            console.log(`  Más lento: ${report.resolutionTime.slowest?.ticketId} (${report.resolutionTime.slowest?.hours}h)`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Fallo en el procesamiento:', error.message);
        } else {
            console.error('Ocurrió un error desconocido');
        }
        process.exit(1);
    }
}

// Ejecutar el procesador
processHelpDeskData();
