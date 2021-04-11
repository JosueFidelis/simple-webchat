const IP = localStorage.getItem('IP');
const username = localStorage.getItem('name');
const socket = io(`http://${IP}:3000`);

/**
 * Variável responsável por controlar o timer e engatilhar o envio da data e a hora.
 */
let timer;

/**
 * Ao carregar a página, abre conexão com o servidor e faz o primeiro contato.
 */
$(document).ready(() => {
    socket.emit('firstConnection', username);
    timer = setTimeout(sendDate, 60000);

    createListeners();
});

/**
 * Ao carregar uma foto, ela é lida, renderizada e enviada ao servidor.
 */
$('#file').on('change', () => {
    const file = document.getElementById('file');
    const reader = new FileReader();

    reader.onload = (event) => {
        const messageObject = createMessageObject(event.target.result, true);
        renderMessage(messageObject);
        socket.emit('sendMessage', messageObject);
    };
    reader.readAsDataURL(file.files[0]);
});

/**
 * Ao enviar uma mensagem, ela é lida, renderizada e enviada ao servidor.
 */
$('#chat').submit((event) => {
    event.preventDefault();

    const message = $('input[name=message]').val();

    $('input[name=message]').val('');

    if (message.length) {
        const messageObject = createMessageObject(message);
        renderMessage(messageObject);
        socket.emit('sendMessage', messageObject);
    }
});

/**
 * Função que Verifica se o usuário está com a barra de rolagem no final.
 */
function checkScrollStatus() {
    const chatDiv = document.getElementById('messages');
    //O "+1" represanta 1 pixel que é uma margem de erro para alguns navegadores.
    const isScrolledToBottom = chatDiv.scrollHeight - chatDiv.clientHeight <= chatDiv.scrollTop + 1;
    return isScrolledToBottom;
}

/**
 * Função responsável por manter a barra de rolagem no final.
 * @param {boolean} isScrolledToBottom booleano que sinaliza se a barra de rolagem está no final ou não.
 */
function updateScroll(isScrolledToBottom) {
    const chatDiv = document.getElementById('messages');
    if (isScrolledToBottom) {
        chatDiv.scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
    }
}

/**
 * Função responsável por renderizar mensagem.
 * @param {object} message Objeto que contém o autor e a mensagem que será renderizada.
 * @param {boolean} isDate Verifica se é a mensagem de data e hora, enviada após 1 minuto de ociosidade do chat.
 */
function renderMessage(message, isDate = false) {

    const isScrolledToBottom = checkScrollStatus();

    //Verifica se a mensagem é a mensagem de data, assim não acionará o envio de uma próxima mensagem com a data.
    if (!isDate) {
        clearInterval(timer);
        timer = setTimeout(sendDate, 60000);
    }
    if ('image' in message) {
        renderImage(message);
    } else {
        renderText(message);
    }

    updateScroll(isScrolledToBottom);
}

/**
 * Função responsável por renderizar uma imagem.
 * @param {object} image Objeto que contem o nome do emissor e a imagem que será renderizada.
 */
function renderImage(image) {
    $('.messages').append(
        `<div class = "message">
            <strong>${image.author}</strong>:
            <br/>
            <a target="_blank" href="${image.image}">
                <img src="${image.image}"/>
            </a>
        </div>`);
}

/**
 * Função responsável por renderizar texto.
 * @param {message} message Objeto que contém o autor e a mensagem que será renderizada.
 */
function renderText(message) {
    $('.messages').append(
        `<div class = "message">                                          
            <strong> ${message.author} </strong>: ${message.message} 
        </div>`);
}

/**
 * Função responsável por enviar a data para os outros clients.
 */
function sendDate() {
    const now = new Date();
    date = `Data: ${now.getDate()}/${now.getMonth()}/${now.getFullYear()} às ${now.getHours()}:${now.getMinutes()}Hrs`;

    const messageObject = createMessageObject(date);
    renderMessage(messageObject, true);
    socket.emit('sendDate', messageObject);
}

/**
 * Cria o objeto mensagem para que possa ser enviado.
 * @param {object} message 
 * @param {boolean} isImage 
 */
function createMessageObject(message, isImage = false) {
    let messageObject;
    if (isImage) {
        messageObject = {
            author: username,
            image: message,
        };
    } else {
        messageObject = {
            author: username,
            message,
        };
    }
    return messageObject;
}

/**
 * Cria os listeners para escutar as mensagens vindas do servidor.
 */
function createListeners() {
    socket.on('previousMessages', (messages) => {
        for (message of messages) {
            renderMessage(message);
        }
    });

    socket.on('receivedMessage', (message) => {
        renderMessage(message);
    });

    socket.on('receivedDate', (date) => {
        renderMessage(date, true);
    });
}
