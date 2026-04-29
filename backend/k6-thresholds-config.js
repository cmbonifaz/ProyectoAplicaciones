/*
 * CONFIGURACIONES DE UMBRALES (THRESHOLDS) PARA K6
 * ==================================================
 * 
 * Este archivo contiene diferentes configuraciones de thresholds para pruebas de carga
 * Cada configuración está diseñada para un escenario específico de prueba
 * 
 * Para usar una configuración, copia el bloque completo de 'options' en tu script de k6
 */

// ============================================================================
// 1. CONFIGURACIÓN DE DESARROLLO - Para pruebas locales rápidas
// ============================================================================
export const developmentConfig = {
    stages: [
        { duration: '5s', target: 5 },      // Ramp-up rápido
        { duration: '10s', target: 10 },    // Carga baja
        { duration: '5s', target: 0 }       // Ramp-down
    ],

    thresholds: {
        // Umbrales relajados para desarrollo
        http_req_duration: ['p(95)<5000'],                   // 95% < 5 segundos
        http_req_failed: ['rate<0.05'],                      // Hasta 5% de fallos permitidos
        'http_req_duration{endpoint:register}': ['p(95)<8000'],
        'http_req_duration{endpoint:login}': ['p(95)<6000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<5000'],
        checks: ['rate>0.90'],                               // Al menos 90% de checks exitosos
    }
};

// ============================================================================
// 2. CONFIGURACIÓN DE PRUEBA DE CARGA LIGERA - Para validación básica
// ============================================================================
export const lightLoadConfig = {
    stages: [
        { duration: '10s', target: 10 },    // Calentamiento
        { duration: '20s', target: 25 },    // Carga ligera
        { duration: '10s', target: 0 }      // Enfriamiento
    ],

    thresholds: {
        // Umbrales moderados
        http_req_duration: ['p(95)<3000', 'p(99)<5000'],     // p95 < 3s, p99 < 5s
        http_req_failed: ['rate<0.02'],                      // < 2% de fallos
        'http_req_duration{endpoint:register}': ['p(95)<5000'],
        'http_req_duration{endpoint:login}': ['p(95)<4000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<3000'],
        http_reqs: ['rate>10'],                              // Mínimo 10 requests/s
        checks: ['rate>0.95'],                               // 95% de checks exitosos
        iteration_duration: ['p(95)<15000'],                 // Iteraciones completas < 15s
    }
};

// ============================================================================
// 3. CONFIGURACIÓN DE PRUEBA DE CARGA MEDIA - Para pruebas normales
// ============================================================================
export const mediumLoadConfig = {
    stages: [
        { duration: '10s', target: 10 },    // Calentamiento
        { duration: '30s', target: 50 },    // Carga media
        { duration: '20s', target: 100 },   // Pico
        { duration: '10s', target: 0 }      // Enfriamiento
    ],

    thresholds: {
        // Umbrales balanceados
        http_req_duration: ['p(95)<10000', 'p(99)<15000'],   // p95 < 10s, p99 < 15s
        http_req_failed: ['rate<0.01'],                      // < 1% de fallos
        'http_req_duration{endpoint:register}': ['p(95)<12000', 'avg<6000'],
        'http_req_duration{endpoint:login}': ['p(95)<10000', 'avg<5000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<8000', 'avg<3000'],
        http_reqs: ['rate>12'],                              // Mínimo 12 requests/s
        checks: ['rate>0.92'],                               // 92% de checks exitosos
        iteration_duration: ['p(95)<30000', 'avg<20000'],    // Control de duración
        vus: ['value<=100'],                                 // No exceder 100 VUs
    }
};

// ============================================================================
// 4. CONFIGURACIÓN DE PRUEBA DE ESTRÉS - Para límites del sistema
// ============================================================================
export const stressTestConfig = {
    stages: [
        { duration: '10s', target: 50 },    // Ramp-up rápido
        { duration: '20s', target: 100 },   // Carga alta
        { duration: '30s', target: 200 },   // Estrés
        { duration: '20s', target: 300 },   // Estrés extremo
        { duration: '20s', target: 0 }      // Enfriamiento
    ],

    thresholds: {
        // Umbrales más permisivos para estrés
        http_req_duration: ['p(95)<20000', 'p(99)<30000'],   // Tiempos más altos permitidos
        http_req_failed: ['rate<0.05'],                      // Hasta 5% de fallos en estrés
        'http_req_duration{endpoint:register}': ['p(95)<25000'],
        'http_req_duration{endpoint:login}': ['p(95)<20000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<15000'],
        checks: ['rate>0.85'],                               // 85% de checks exitosos
        iteration_duration: ['p(95)<60000'],                 // Hasta 60s por iteración
    }
};

// ============================================================================
// 5. CONFIGURACIÓN DE PRUEBA DE PICOS (SPIKE TEST) - Para cambios repentinos
// ============================================================================
export const spikeTestConfig = {
    stages: [
        { duration: '5s', target: 10 },     // Carga normal
        { duration: '2s', target: 200 },    // PICO REPENTINO
        { duration: '10s', target: 200 },   // Mantener pico
        { duration: '5s', target: 10 },     // Regreso a normal
        { duration: '5s', target: 0 }       // Enfriamiento
    ],

    thresholds: {
        // Medir recuperación ante picos
        http_req_duration: ['p(95)<15000'],
        http_req_failed: ['rate<0.10'],                      // Hasta 10% de fallos durante pico
        'http_req_duration{endpoint:register}': ['p(95)<20000'],
        'http_req_duration{endpoint:login}': ['p(95)<15000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<12000'],
        checks: ['rate>0.80'],                               // 80% de checks exitosos
    }
};

// ============================================================================
// 6. CONFIGURACIÓN DE PRUEBA DE RESISTENCIA (SOAK TEST) - Para estabilidad prolongada
// ============================================================================
export const soakTestConfig = {
    stages: [
        { duration: '10s', target: 30 },    // Ramp-up
        { duration: '5m', target: 30 },     // Carga sostenida por 5 minutos
        { duration: '10s', target: 0 }      // Ramp-down
    ],

    thresholds: {
        // Detectar degradación en el tiempo
        http_req_duration: ['p(95)<8000', 'avg<4000'],
        http_req_failed: ['rate<0.01'],
        'http_req_duration{endpoint:register}': ['p(95)<10000', 'avg<6000'],
        'http_req_duration{endpoint:login}': ['p(95)<8000', 'avg<5000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<6000', 'avg<3000'],
        checks: ['rate>0.95'],
        // Importante: detectar fugas de memoria o degradación
        http_reqs: ['rate>8', 'rate<20'],                    // Rango estable de throughput
    }
};

// ============================================================================
// 7. CONFIGURACIÓN DE PRUEBA DE PRODUCCIÓN - Para ambiente real
// ============================================================================
export const productionConfig = {
    stages: [
        { duration: '15s', target: 20 },    // Calentamiento gradual
        { duration: '1m', target: 50 },     // Carga típica
        { duration: '30s', target: 100 },   // Pico moderado
        { duration: '1m', target: 50 },     // Regreso a carga típica
        { duration: '15s', target: 0 }      // Enfriamiento
    ],

    thresholds: {
        // SLA estrictos para producción
        http_req_duration: ['p(95)<2000', 'p(99)<5000', 'avg<1000'],  // Requisitos estrictos
        http_req_failed: ['rate<0.001'],                               // < 0.1% de fallos
        'http_req_duration{endpoint:register}': ['p(95)<3000', 'avg<2000'],
        'http_req_duration{endpoint:login}': ['p(95)<2000', 'avg<1000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<1500', 'avg<800'],
        http_reqs: ['rate>15'],                                        // Throughput mínimo
        checks: ['rate>0.99'],                                         // 99% de checks exitosos
        iteration_duration: ['p(95)<12000', 'avg<8000'],
        
        // Umbrales de latencia por operación
        http_req_connecting: ['p(95)<100'],                            // Conexión < 100ms
        http_req_waiting: ['p(95)<1800'],                              // Espera < 1.8s
    }
};

// ============================================================================
// 8. CONFIGURACIÓN POR ENDPOINT - Para probar endpoints específicos
// ============================================================================
export const endpointSpecificConfig = {
    stages: [
        { duration: '10s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 }
    ],

    thresholds: {
        // Umbrales generales
        http_req_duration: ['p(95)<8000'],
        http_req_failed: ['rate<0.01'],
        
        // Umbrales específicos por endpoint con múltiples condiciones
        'http_req_duration{endpoint:register}': [
            'p(90)<8000',      // 90% < 8s
            'p(95)<12000',     // 95% < 12s
            'p(99)<15000',     // 99% < 15s
            'avg<6000',        // Promedio < 6s
            'max<20000'        // Máximo < 20s
        ],
        'http_req_duration{endpoint:login}': [
            'p(90)<6000',
            'p(95)<10000',
            'p(99)<12000',
            'avg<5000',
            'med<4000'         // Mediana < 4s
        ],
        'http_req_duration{endpoint:reservas}': [
            'p(90)<4000',
            'p(95)<8000',
            'p(99)<10000',
            'avg<3000',
            'min>1'            // Mínimo > 1ms (detectar respuestas cacheadas anormales)
        ],
        
        // Checks por tipo de operación
        'checks{operation:auth}': ['rate>0.98'],
        'checks{operation:crud}': ['rate>0.95'],
    }
};

// ============================================================================
// 9. CONFIGURACIÓN DE UMBRALES AVANZADOS - Con métricas adicionales
// ============================================================================
export const advancedThresholdsConfig = {
    stages: [
        { duration: '10s', target: 25 },
        { duration: '30s', target: 75 },
        { duration: '10s', target: 0 }
    ],

    thresholds: {
        // Duración de requests
        http_req_duration: ['p(95)<10000', 'p(50)<3000'],
        http_req_failed: ['rate<0.01'],
        
        // Tiempos de conexión y espera
        http_req_blocked: ['p(95)<200'],                     // Tiempo bloqueado < 200ms
        http_req_connecting: ['p(95)<150'],                  // Tiempo de conexión < 150ms
        http_req_sending: ['p(95)<50'],                      // Tiempo de envío < 50ms
        http_req_waiting: ['p(95)<8000'],                    // Tiempo de espera < 8s
        http_req_receiving: ['p(95)<100'],                   // Tiempo de recepción < 100ms
        
        // Throughput y rendimiento
        http_reqs: ['rate>10', 'count>500'],                 // Mínimo 10 req/s y 500 totales
        data_received: ['rate>10000'],                       // Mínimo 10KB/s recibidos
        data_sent: ['rate>5000'],                            // Mínimo 5KB/s enviados
        
        // Iteraciones y checks
        iterations: ['rate>2'],                              // Mínimo 2 iteraciones/s
        iteration_duration: ['p(95)<25000', 'avg<15000'],
        checks: ['rate>0.95'],
        
        // VUs
        vus: ['value<=75'],                                  // Control de usuarios máximos
        vus_max: ['value<=100'],
    }
};

// ============================================================================
// 10. CONFIGURACIÓN DE UMBRALES ABORTIVOS - Detiene la prueba si falla
// ============================================================================
export const abortOnFailureConfig = {
    stages: [
        { duration: '10s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 }
    ],

    thresholds: {
        // Usar 'abortOnFail' para detener la prueba inmediatamente si se viola
        http_req_duration: [
            { threshold: 'p(95)<15000', abortOnFail: true }   // Detener si p95 > 15s
        ],
        http_req_failed: [
            { threshold: 'rate<0.05', abortOnFail: true }     // Detener si > 5% fallan
        ],
        'http_req_duration{endpoint:register}': [
            { threshold: 'p(99)<20000', abortOnFail: false },  // Solo advertir
            { threshold: 'max<30000', abortOnFail: true }      // Detener si alguno > 30s
        ],
        checks: [
            { threshold: 'rate>0.90', abortOnFail: true }     // Detener si < 90% exitosos
        ],
    },
    
    // Configuración adicional
    noConnectionReuse: false,                                // Reutilizar conexiones
    userAgent: 'K6LoadTest/1.0',                            // User agent personalizado
};

// ============================================================================
// EJEMPLO DE USO EN TU SCRIPT
// ============================================================================
/*

import http from 'k6/http';
import { check, sleep } from 'k6';
import { mediumLoadConfig } from './k6-thresholds-config.js';

// Usa la configuración importada
export let options = mediumLoadConfig;

const BASE_URL = 'http://localhost:3000/api';

export default function () {
    // Tu código de prueba aquí...
}

*/

// ============================================================================
// GUÍA RÁPIDA DE UMBRALES (THRESHOLDS)
// ============================================================================
/*

SINTAXIS DE THRESHOLDS:

1. Percentiles:
   - p(95)<1000    → 95% de requests < 1000ms
   - p(99)<2000    → 99% de requests < 2000ms
   - p(50)<500     → Mediana < 500ms (50% de requests)

2. Estadísticas:
   - avg<1000      → Promedio < 1000ms
   - min>10        → Mínimo > 10ms
   - max<5000      → Máximo < 5000ms
   - med<500       → Mediana < 500ms

3. Tasas:
   - rate<0.01     → Tasa < 1% (para errores)
   - rate>0.95     → Tasa > 95% (para checks exitosos)

4. Contadores:
   - count>100     → Mínimo 100 requests
   - rate>10       → Mínimo 10 requests/segundo

5. Tags personalizados:
   - 'http_req_duration{endpoint:login}': ['p(95)<1000']
   - 'http_req_duration{method:POST}': ['avg<800']

6. Múltiples condiciones:
   http_req_duration: ['p(95)<1000', 'p(99)<2000', 'avg<500']

7. Abort on fail:
   http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }]

MÉTRICAS DISPONIBLES:
- http_req_duration       → Duración total del request
- http_req_blocked        → Tiempo esperando conexión TCP disponible
- http_req_connecting     → Tiempo estableciendo conexión TCP
- http_req_tls_handshaking → Tiempo en handshake TLS
- http_req_sending        → Tiempo enviando datos
- http_req_waiting        → Tiempo esperando respuesta (TTFB)
- http_req_receiving      → Tiempo recibiendo datos
- http_req_failed         → Tasa de requests fallidos
- http_reqs              → Contador de requests
- checks                 → Tasa de checks exitosos
- data_received          → Datos recibidos
- data_sent              → Datos enviados
- iterations             → Iteraciones completadas
- iteration_duration     → Duración de iteraciones
- vus                    → Usuarios virtuales activos
- vus_max                → Máximo de usuarios virtuales

*/
