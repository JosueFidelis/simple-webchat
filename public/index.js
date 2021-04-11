/**
 * Ao carregar a página salva o hostname.
 */
$(document).ready(function(){
    console.log(document.location.hostname);
    $('input[name=IP]').val(document.location.hostname);
});

/**
 * Guarda o nome do usuário e o IP do servidor de destino.
 */
$('#chat').submit(function(event) {
    event.preventDefault();

    let name = $('input[name=username]').val();
    let IP = $('input[name=IP]').val();

    if (name.length) {
        localStorage.setItem('name', name);
        localStorage.setItem('IP', IP);
    
        window.location.replace("chat.html");
    } else {
        alert("Por favor escreva seu nome");
    }

});