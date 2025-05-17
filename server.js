const WebSocket = require('ws');
const net = require('net');

// Параметри підключення до TCP сервера
const server_ip = '192.168.43.43';
const server_port = 8083;

// Створення WebSocket сервера
const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('WebSocket сервер запущено на порту 8080');
});

// Обробка підключення WebSocket клієнтів
wss.on('connection', (ws) => {
    console.log('Клієнт підключився через WebSocket');

    // Обробка отриманих повідомлень від WebSocket клієнта
    ws.on('message', (message) => {
        console.log(`Отримано повідомлення від клієнта: ${message}`);

        // Підключення до TCP сервера
        const clientSocket = new net.Socket();
        clientSocket.connect(server_port, server_ip, () => {
            console.log(`Підключено до TCP сервера на ${server_ip}:${server_port}`);
            clientSocket.write(message);
        });

        // Отримання відповіді від TCP сервера
        clientSocket.on('data', (data) => {
            console.log(`Відповідь від TCP сервера: ${data.toString()}`);
            ws.send(data.toString()); // Надсилання відповіді WebSocket клієнту
            clientSocket.destroy(); // Закриття TCP з'єднання після відповіді
        });

        // Обробка помилок TCP з'єднання
        clientSocket.on('error', (err) => {
            console.error('Помилка TCP зєднання:', err.message);
            ws.send(`Помилка TCP з'єднання: ${err.message}`);
        });

        // Закриття TCP з'єднання
        clientSocket.on('close', () => {
            console.log('TCP зєднання закрито.');
        });
    });

    // Обробка закриття з'єднання WebSocket клієнта
    ws.on('close', () => {
        console.log('Клієнт відключився');
    });
});

console.log('WebSocket сервер готовий приймати зєднання.');