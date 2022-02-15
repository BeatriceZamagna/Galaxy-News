const creaTriviaUrl = 'http://localhost:8000/searchTrivia/creaTrivia/mixed/100';
const partecipaTriviaUrl = 'http://localhost:8000/searchTrivia/partecipaTrivia/mixed/100';
const solutionTriviaUrl = 'http://localhost:8000/searchTrivia/soluzioneTrivia/mixed/100';

var trivia = new Map(); //mappa che associa al trivia (identificato dal suo nome) una mappa di risposte
var user_name = new Map(); //mappa che associa ad ogni"id utente" il corrispondente "nome utente"
var user_point = new Map(); //mappa che associa all'id utente il suo punteggio
var top_user = new Map();
var user_picture = new Map(); //utente / immagine del profilo


function TwStringToDate(s) { //converte la data di pubblicazione di un trivia-tweet in un formato "comodo"
    var b = s.split(/[: ]/g);
    var m = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11
    };
    return new Date(Date.UTC(b[7], m[b[1].toLowerCase()], b[2], b[3], b[4], b[5]));
}

window.onload = function() {
    getTrivia();
}

function getTrivia() {
    $.ajax({
        type: 'GET',
        url: creaTriviaUrl,
        crossDomain: true,
        success: function(data) { //ottiene tutti i tweet con quell'hashtag
            for (let i in data.statuses) {
                let text = data.statuses[i].full_text;
                noHashtag = text.replace('#creaTrivia ', ''); //elimino l'hashtag
                var index = noHashtag.indexOf(" "); // Gets the first index where a space occours
                var nomeTrivia = noHashtag.substring(0, index); // Gets the first part
                if (nomeTrivia.charAt(nomeTrivia.length - 1) == " " || nomeTrivia.charAt(nomeTrivia.length - 1) == ",") {
                    nomeTrivia = nomeTrivia.substr(0, nomeTrivia.length - 1);
                }
                var domandaTrivia = noHashtag.substring(index + 1);
                let id_user = data.statuses[i].user.id_str; //estrae id e nome profilo dell'utente
                let user_name = data.statuses[i].user.screen_name;
                let user_picture = data.statuses[i].user.profile_image_url_https;
                insertUser(id_user, user_name); //aggiorna la mappatura id_utente/nome_utente
                insertTrivia(nomeTrivia, id_user, domandaTrivia); //crea il trivia
                insertPicture(id_user, user_picture);
            }
            getSolution();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function insertUser(id, name) { //id utente, nome utente
    if (!user_name.has(id)) { //l'id utente non è ancora registrato nella mappa "user_name"...
        user_name.set(id, name); //registra id utente, associando il nome utente
    }
}

function insertPicture(id, picture) {
    if (!user_picture.has(id)) { //l'id utente non è ancora registrato nella mappa "user_picture"...
        user_picture.set(id, picture);
    }
}

function insertTrivia(name, id, domandaTrivia) { //nome del trivia, id utente
    if (!trivia.has(name)) { //il trivia non esiste ancora nell'hashmap dei trivia
        let risposte = new Map(); //crea una mappa delle risposte per quel trivia
        risposte.set("domanda", domandaTrivia);
        trivia.set(name, risposte); //e rendila il "value" di name
        insertRisposta(name, null, id); //funzione che setta la tupla del "creatore" del trivia
    }
}

function getSolution() {
    $.ajax({
        type: 'GET',
        url: solutionTriviaUrl,
        crossDomain: true,
        success: function(data) {
            for (let i in data.statuses) {
                let solution = data.statuses[i].full_text;
                solution = solution.replace('#soluzioneTrivia ', ''); //elimina l'hashtag
                solution = solution.split(','); //splitta in due metà in corrispondenza della virgola
                let triviaName = solution[0].replace(' ', ''); //elimina gli spazi nelle due metà
                let risposta = solution[1].replace(' ', '');
                let id_user = data.statuses[i].user.id_str; //estrae id e nome utente
                let user_name = data.statuses[i].user.screen_name;
                insertUser(id_user, user_name);
                let timeSet = data.statuses[i].created_at //estrae la data di pubblicazione del tweet che contiene la soluzione
                timeSet = TwStringToDate(timeSet); //converte la data nel formato corretto
                insertSolution(triviaName, risposta, id_user, timeSet);
            }
            getRisposte();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function insertSolution(triviaName, risposta, id_user, timeSet) { //aggiunge all'hashmap di risposte un obj con key:"answer" e value:soluzione del trivia
    if (trivia.has(triviaName)) { //se il trivia esiste già...
        if (trivia.get(triviaName).get("creator_id") === id_user) { //se la soluzione è giunta dallo stesso utente che ha creato il trivia...
            let risposte = trivia.get(triviaName); //ottiene tutte le risposte corrispondenti al trivia
            let obj = { risposta: risposta, time: timeSet };
            risposte.set("answer", obj); //aggiunge un oggetto contenente la soluzione nelle risposte del trivia
            trivia.set(triviaName, risposte); //aggiorna la mappa "trivia" con le modifiche appena fatte
        }
    }
}

function getRisposte() {
    $.ajax({
        type: 'GET',
        url: partecipaTriviaUrl,
        crossDomain: true,
        success: function(data) {
            for (let i in data.statuses) {
                let partecipation = data.statuses[i].full_text;
                partecipation = partecipation.replace('#partecipaTrivia ', ''); //elimina hashtag
                partecipation = partecipation.split(','); //splitta in corrispondenza della virgola
                let triviaName = partecipation[0].replace(' ', ''); //elimina gli spazi nelle due metà
                let risposta = partecipation[1].replace(' ', '');
                let id_user = data.statuses[i].user.id_str; //estrae id utente e nome utente
                let username = data.statuses[i].user.screen_name;
                let user_picture = data.statuses[i].user.profile_image_url_https;
                insertUser(id_user, username);
                insertPicture(id_user, user_picture);
                let timeSet = data.statuses[i].created_at
                timeSet = TwStringToDate(timeSet);
                insertRisposta(triviaName, risposta, id_user, timeSet, username); //registra la risposta
            }
            countPoints();
            console.log(trivia);
            podium();
            exctractVisualData();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function insertRisposta(triviaName, risposta, id_user, timeSet, username) { //bisogna controllare che non vengano aggiunte risposte con data dopo la data di answer
    if (trivia.has(triviaName)) { //il trivia esiste già
        let risposte = trivia.get(triviaName); //estrae le risposte del trivia
        if (risposta === null) { //se il parametro è null, allora siamo in fase di creazione del trivia
            risposte.set("creator_id", id_user); //registrs l'id del creatore del trivia
            trivia.set(triviaName, risposte); //aggiorna la mappa "trivia" con le modifiche appena fatte
        } else {
            if (!(risposte.get("creator_id") === id_user) && !risposte.has(id_user)) { //la risposta non viene dal creatore del trivia && l'utente non ha già risposto
                if ((risposte.has("answer") && timeSet <= risposte.get("answer").time) || !risposte.has("answer")) { //la risposta è stata data prima della pubblicazione della soluzione || soluzione non ancora pubblicata
                    risposte.set(id_user, risposta); //aggiorna la mappa delle risposte
                    trivia.set(triviaName, risposte) //aggiorna la mappa "trivia" con le modifiche appena fatte
                    user_point.set(id_user, 0); //inserisci l'utente nella mappa dei punteggi (inizializza a 0)
                }
            }
        }
    }
}

function countPoints() {
    for (let [key, value] of trivia) { //per ogni trivia...
        let list_risposte = trivia.get(key); //ottieni la mappa delle risposte corrispondente
        for (let [key2, value2] of list_risposte) { //per ogni mappa di risposte...
            if (list_risposte.has("answer")) { //controlla che sia presente la soluzione
                if (key2 != "creator_id" && key2 != "answer") { //analizza solo le tuple dei partecipanti, ignora quelle del creatore e della soluzione
                    if (list_risposte.get(key2) == list_risposte.get("answer").risposta) { //risposta corretta
                        point = user_point.get(key2) + 10; //aggiorna il punteggio dell'utente che ha dato la risposta giusta
                        user_point.set(key2, point);
                    } else {
                        point = user_point.get(key2) - 5; //diminuisci il punteggio dell'utente che ha dato la risposta sbagliata
                        if (point >= 0) {
                            user_point.set(key2, point);
                        } else {
                            user_point.set(key2, 0); //La mappa "user_point" non ammette punteggi negativi
                        }
                    }
                }
            }
        }
    }
}

function createGrapichs() {
    for (let [key, value] of trivia) {
        let list_risposte = trivia.get(key);
        let num_risposte = list_risposte.size - 2; //non conta le tuple del creatore e della soluzione
        console.log("Il trivia " + key + " ha ricevuto " + num_risposte + " risposte.");
        let risp_corrette = 0;
        for (let [key2, value2] of list_risposte) {
            if (list_risposte.has("answer")) { //soluzione pubblicata
                if (key2 != "creator_id" && key2 != "answer") { //cerca nelle tuple che non sono quella della soluzione o quella del creatore
                    if (list_risposte.get(key2) == list_risposte.get("answer").risposta) {
                        risp_corrette++; //se le risposte combaciano con la soluzione, aumenta conteggio
                    }
                }
            }
        }
        console.log("Di cui corrette:" + risp_corrette);
        topPlayers(3);
        console.log(top_user);
    }

    let maxPoint = 0; //punteggio massimo
    let winner = ""; //stringa del vincitore
    for (let [key, value] of user_point) { //cerca nella mappa che ad ogni utente associa il punteggio
        if (value > maxPoint) {
            maxPoint = value; //aggiorna vincitore
            winner = key;
        }
    }
    if (winner != "") {
        let winner_name = user_name.get(winner);
        console.log("Il vincitore del trivia è " + winner_name);
    } else {
        console.log("Nessun vincitore");
    }
}

function topPlayers(k) { // k è il numero di giocatori da resitutire, es: top3 k=3
    for (let i = 0; i < k; i++) {
        let max = -1;
        let id = "";
        for (let [key, value] of user_point) {
            if (value > max && !top_user.has(key)) {
                max = value;
                id = key;
            }
        }
        if (max != -1) {
            top_user.set(id, max);
        }
    }
}

function podium() {
    topPlayers(3);
    drawPodium(top_user, user_name, user_picture, 0);
}

function drawTitle(key) {
    var title = document.createElement('div');
    title.id = "title_" + key;
    title.className = "title";
    if (trivia.get(key).has("answer")) {
        console.log(trivia.get(key).get("answer"));
        title.innerHTML = key + " => CHIUSO, risposta corretta : " + trivia.get(key).get("answer").risposta;
    } else {
        title.innerHTML = key;
    }
    document.getElementById('container_concorso').appendChild(title);
}

function drawQA(key, question, answer) {
    let newQ = question.split('\n');
    console.log(newQ);
    var title = document.createElement('div');
    title.id = "question_" + key;
    title.className = "title";
    title.innerHTML = newQ[0];
    for (let i = 1; i < newQ.length; i++) {
        let li = document.createElement("li");
        li.id = "trivia-li";
        li.innerText = newQ[i];
        title.appendChild(li);
    }
    document.getElementById('container_concorso').appendChild(title);

    if (answer) {
        var ans = document.createElement('div');
        ans.id = "answer_" + key;
        ans.className = "title";
        ans.innerHTML = answer;
        document.getElementById('container_concorso').appendChild(title);
    }
}

function exctractVisualData() {
    let i = 0;
    for (let [key, value] of trivia) {
        let contA = 0;
        let contB = 0;
        let contC = 0;
        let contD = 0;
        let list_risposte = trivia.get(key);
        for (let [key2, value2] of list_risposte) {
            if (value2 == 'A') contA++;
            if (value2 == 'B') contB++;
            if (value2 == 'C') contC++;
            if (value2 == 'D') contD++;
        }
        let data = [{ value: contA, name: 'A' }, { value: contB, name: 'B' }, { value: contC, name: 'C' }, { value: contD, name: 'D' }];
        drawTitle(key);
        drawQA(key, value.get("domanda"), value.get("answer"));
        drawIstogram(data, i, key);
        drawDonut(data, i, key);
        i++;
    }
}