import type { Config } from 'jest';

const config: Config = {
  // ts-jest transforma TypeScript sin necesidad de compilar a JS primero
  preset: 'ts-jest',

  // Entorno Node.js (no browser)
  testEnvironment: 'node',

  // Dónde buscar los archivos de test
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Carga variables de entorno de test ANTES de que se importe app.ts
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],

  // El proyecto mezcla imports con y sin extensión ".js" apuntando a
  // archivos ".ts" (estilo ESM). TypeScript lo resuelve al compilar, pero
  // el resolvedor de módulos de Jest no — hay que reescribirlo a mano.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Cada test corre con timers/mocks limpios — evita que un test contamine el siguiente
  clearMocks: true,

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts', // entry point — no se testea directamente
    '!src/types/**',
    '!src/**/*.d.ts',
  ],

  // Umbrales mínimos exigidos por la rúbrica de la semana 09
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },

  // Los tests de integración (Mongo en memoria) tardan más en arrancar
  testTimeout: 20000,
};

export default config;
