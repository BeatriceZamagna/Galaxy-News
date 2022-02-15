const socket = io("http://localhost:8000/") // non so perchè ma questa cosa va fatta e va bene così
let stream_history = new Map();

socket.on('connection', () => { //ecco ecco è questo il punto in cui si apre la connessione con il server, appena apriamo la nuova paginetta
    console.log('Connected to server...') // e infatti siamo connessi a questo punto

})
socket.on('tweet', (tweet) => { //qui ascoltiamo l'evento tweet iniziato dal server e prendiamo quello che arriva

    if (!stream_history.has(tweet.data.id)) {
        stream_history.set(tweet.data.id, 0);
        var id = tweet.data.id;
        var url_tweet = 'https://twitter.com/tweet/status/' + id; //questo è l'url che mi rappesenta ogni singolo stramaledetto tweet

        //segue embedding dei tweet classico che conosciamo e amiamo tutti
        var prova = `<blockquote class="twitter-tweet ourTweets" id="${id}">
          <a href="${url_tweet}"></a> </blockquote>`;
        $("#space").prepend(prova);
        var scriptTweet = `<script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
        $("#space").append(scriptTweet);
    }

})

function closeStream() {
    $.ajax({
        type: 'GET',
        async: false,
        url: "http://localhost:8000/" + "stream/closing",
        crossDomain: true,
        success: function() {
            console.log("Closed");
            stream_history.clear();
            setTimeout(() => window.close(), 1000);
        }
    })
}


// function closingStream() {
//     location.href = "http://localhost:8000/streamclosing";
//     setTimeout(() => socket.removeAllListeners(), 1000);
// }

// function closeWindow() {
//     closingStream();
//     setTimeout(() => window.close(), 2000);
// }