const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/**
 * Configura a inicialização do servidor.
 */
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

/**
 * Guarda as mensagens enviadas pelos clients.
 */
const messages = [];
/**
 * Guarda os usuários conectados.
 */
const authors = {};
/**
 * Funções para serem executadas ao receber dados do client.
 */
io.on('connection', (socket) => {
    //Ao iniciar uma nova conexão, envia o histórico da conversa para o client.
    socket.emit('previousMessages', messages);

    socket.on('sendMessage', (data) => {
        messages.push(data);

        socket.broadcast.emit('receivedMessage', data);
    });

    socket.on('sendDate', (date) => {
        messages.push(date);

        socket.broadcast.emit('receivedDate', date);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('receivedMessage', { author: authors[socket.id], message: 'disconnected' });
        delete authors[socket.id];
    });

    socket.on('firstConnection', (author) => {
        authors[socket.id] = author;
        socket.broadcast.emit('receivedMessage', { author: authors[socket.id], message: 'connected' });
    });
});

server.listen(3000);
