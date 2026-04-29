import http from 'k6/http';
import { check, sleep } from 'k6';

// b. Configurar la prueba
export let options = {
    stages: [
        { duration: '10s', target: 10 },   // Calentamiento: 10 usuarios en 10 segundos
        { duration: '30s', target: 50 },   // Carga: 50 usuarios en 30 segundos
        { duration: '20s', target: 100 },  // Pico: 100 usuarios en 20 segundos
        { duration: '10s', target: 0 }     // Enfriamiento: reducir a 0 usuarios
    ],

    thresholds: {
        http_req_duration: ['p(95)<10000'],      // 95% de las peticiones deben tardar menos de 10s
        http_req_failed: ['rate<0.01'],          // Menos del 1% de las peticiones deben fallar
        'http_req_duration{endpoint:register}': ['p(95)<12000'],  // Register suele ser más lento por el hashing
        'http_req_duration{endpoint:login}': ['p(95)<10000'],
        'http_req_duration{endpoint:reservas}': ['p(95)<8000'],
    }
};

const BASE_URL = 'http://localhost:3000/api';

// d. Crear una función que se ejecuta por cada usuario virtual en cada iteración
export default function () {
    // c. Generar datos únicos para enviar usando VU (Virtual User) e iteración
    const vu = __VU;           // Número del usuario virtual
    const iter = __ITER;       // Número de iteración
    const uniqueEmail = `usuario_${vu}_${iter}_${Date.now()}@test.com`;
    const password = `password_${vu}_${iter}`;

    // 1. Registrar un nuevo usuario
    const registerPayload = JSON.stringify({
        correo: uniqueEmail,
        contraseña: password
    });

    const registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'register' }
    });

    // e. Verificar que las respuestas sean OK (200 o 201)
    check(registerRes, {
        'register status is 201': (r) => r.status === 201,
        'register response time < 800ms': (r) => r.timings.duration < 800,
    });

    sleep(0.5); // Pequeña pausa entre requests

    // 2. Login con el usuario recién creado
    const loginPayload = JSON.stringify({
        correo: uniqueEmail,
        contraseña: password
    });

    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'login' }
    });

    check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login response time < 500ms': (r) => r.timings.duration < 500,
        'token received': (r) => r.json('token') !== undefined
    });

    // Extraer el token del login
    let token = null;
    if (loginRes.status === 200) {
        token = loginRes.json('token');
    }

    if (!token) {
        console.log(`VU ${vu} Iter ${iter}: No se obtuvo token, abortando`);
        return;
    }

    sleep(0.5);

    // 3. Crear una reserva
    const salas = ['A', 'B', 'C'];
    const salaAleatoria = salas[Math.floor(Math.random() * salas.length)];
    
    const reservaPayload = JSON.stringify({
        fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        sala: salaAleatoria,
        hora: `${10 + (vu % 8)}:00` // Horas entre 10:00 y 17:00
    });

    const createReservaRes = http.post(`${BASE_URL}/reservas`, reservaPayload, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        tags: { endpoint: 'reservas' }
    });

    check(createReservaRes, {
        'create reserva status is 201': (r) => r.status === 201,
        'create reserva response time < 600ms': (r) => r.timings.duration < 600,
        'reserva has id': (r) => r.json('_id') !== undefined
    });

    let reservaId = null;
    if (createReservaRes.status === 201) {
        reservaId = createReservaRes.json('_id');
    }

    sleep(0.5);

    // 4. Listar todas las reservas del usuario
    const listReservasRes = http.get(`${BASE_URL}/reservas`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        tags: { endpoint: 'reservas' }
    });

    check(listReservasRes, {
        'list reservas status is 200': (r) => r.status === 200,
        'list reservas response time < 400ms': (r) => r.timings.duration < 400,
        'reservas is array': (r) => Array.isArray(r.json())
    });

    sleep(0.5);

    // 5. Eliminar la reserva creada
    if (reservaId) {
        const deleteReservaRes = http.del(`${BASE_URL}/reservas/${reservaId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            tags: { endpoint: 'reservas' }
        });

        check(deleteReservaRes, {
            'delete reserva status is 200': (r) => r.status === 200,
            'delete reserva response time < 400ms': (r) => r.timings.duration < 400,
        });
    }

    // f. Esperar 1 segundo antes de repetir (simula comportamiento realista)
    sleep(1);
}
