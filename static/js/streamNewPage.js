const serverUrl = "http://localhost:8000/"
var newWindow;

function streamPage() {
    if (newWindow) newWindow.close(); //c'è gia una window, la chiudo
    newWindow = window.open( // apro la nuova paginetta in un nuovo tab
        'http://localhost:8000/stream/tweets',
        '_blank'
    );
}