import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Ticket, ProcessedReport, Resolution } from './types.js';

const DATA_DIR = './data';
const INPUT_FILE = join(DATA_DIR, 'tickets.json');
const OUTPUT_FILE = join(DATA_DIR, 'report.json');

async function ensureDataDirectory(): Promise<void> {
    try {
        await mkdir(DATA_DIR, { recursive: true });
    } catch (error: any) {
        if (error.code !== 'EEXIST') {
            console.error('Error al crear el directorio de datos:', error);
            throw error;
        }
    }
}

async function processHelpDeskData(): Promise<void> {
    try {
        console.log('Iniciando procesamiento de datos del Help Desk...');
        await ensureDataDirectory();

        // 1. Lectura asíncrona (I/O no bloqueante)
        const rawData = await readFile(INPUT_FILE, 'utf-8');
        const tickets: Ticket[] = JSON.parse(rawData);

        // 2. Transformación de datos
        const report: ProcessedReport = {
            totalTickets: tickets.length,
            closedTickets: tickets.filter(t => t.status === 'closed').length,
            openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
            resolutions: tickets
                .filter(t => t.status === 'closed' && t.resolution)
                .map(t => t.resolution as Resolution)
        };

        // 3. Escritura asíncrona
        await writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf-8');

        console.log(`Procesamiento exitoso. Reporte guardado en: ${OUTPUT_FILE}`);
        console.log(`Tickets cerrados: ${report.closedTickets}/${report.totalTickets}`);

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