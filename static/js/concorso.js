const bandisciConcorsoUrl = 'http://localhost:8000/searchHashtag/bandiscoConcorso/mixed/100';
const partecipoConcorsoUrl = 'http://localhost:8000/searchHashtag/partecipoConcorso/mixed/100';
const votoRaccontoUrl = 'http://localhost:8000/searchHashtag/votoRacconto/mixed/100';
var concorsi = new Map();
var votiUtente = new Map(); //hasmap che ha come key:id utente e value: numero di voti effettuati, serve a controllare che un utente non voti più
//di 10 volte

window.onload = function() {
        getConcorsi();
    }
    //funzione che raccoglie i tweet relativi alla creazione dei concorsi letterari
function getConcorsi() {
    $.ajax({
        type: 'GET',
        url: bandisciConcorsoUrl,
        crossDomain: true,
        success: function(data) {
            for (let i in data.statuses) {
                let nomeConcorso = data.statuses[i].text;
                nomeConcorso = nomeConcorso.replace('#bandiscoConcorso ', '');
                insertConcorso(nomeConcorso);
            }
            getRacconti();
            console.log(concorsi);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
//funzione che inserisce i concorsi raccolti in hashmap con key:NomeConcorso e value: una hashmap di racconti
function insertConcorso(name) {
    if (!concorsi.has(name)) { //il concorso non è già stato bandito --> è nuovo!
        let racconti = new Map(); //crea una nuova hashmap vuota di racconti, che sarà il valore corrispondente alla chiave nome nell'hashmap "concorsi"
        concorsi.set(name, racconti);
    }
}
//funzione che raccoglie tutti i tweet relativi ai racconti
function getRacconti() {
    $.ajax({
        type: 'GET',
        url: partecipoConcorsoUrl,
        crossDomain: true,
        success: function(data) {
            for (let i in data.statuses) {
                let partecipation = data.statuses[i].text; //i tweet dei racconti in gara contengono il testo "#partecipoConcorso Concorso1, NomeRacconto"
                partecipation = partecipation.replace('#partecipoConcorso ', ''); //elimina hashtag #partecipoRacconto
                partecipation = partecipation.split(','); //separa nomeConcorso da nomeRacconto
                let concorso = partecipation[0]; //ottieni concorso di riferimento
                let racconto = partecipation[1]; //ottieni racconto corrente
                if (racconto.charAt(0) == " ") {
                    racconto = racconto.substr(1);
                }
                insertRacconto(concorso, racconto); //inserisci nei racconti di quel particolare concorso
            }
            getVoti();
        },
        error: function(err) {
            console.log(err);
        }
    });
}
//funzione che inserisce i racconti nel concorso corrispondente, li inserisce nell hashmap che è il value dell hashmap
//dei racconti, questa hashmap ha come key:nomeRacconto value:votiRacconto
function insertRacconto(concorso, nomeRacconto) {
    if (concorsi.has(concorso)) { //concorso già inserito precedentemente --> si può inserire il racconto
        let racconti = concorsi.get(concorso); //estrae value di concorsi --> l'hashmap dei racconti
        racconti.set(nomeRacconto, 0); //aggingi nuovo racconto, con numero di voti a 0
        concorsi.set(concorso, racconti) //rimette l'hashmap dei racconti appena modificata come value concorso
    }
}
//funzione che raccoglie tutti i tweet relativi ai voti dei racconti
function getVoti() {
    $.ajax({
        type: 'GET',
        url: votoRaccontoUrl, //avvia la ricerca per hashtag
        crossDomain: true,
        success: function(data) {
            console.log(data);
            for (let i in data.statuses) {
                //controllo che l'utente non abbia votato più di 10 volte
                let id = data.statuses[i].user.id_str;
                if (votiUtente.has(id)) { //l'utente aveva già votato, quindi è nell'hashmap votiUtente
                    let cont = votiUtente.get(id); //otteniamo il val corrispondente alla chiave "utente"
                    votiUtente.set(id, cont + 1) //aumentiamo il numero di voti espressi dall'utente
                } else {
                    votiUtente.set(id, 1) //votante nuovo: si aggiuinge all'hashmap votiUtente registrando il suo primo voto
                }

                if (votiUtente.get(id) <= 10) { //Dobbiamo aggiornare il numero dei voti ottenuti dal racconto...
                    let voto = data.statuses[i].text; //i tweet del voto hanno la seguente forma: "#votoConcorso NomeRacconto"
                    voto = voto.replace('#votoRacconto ', ''); //elimina hashtag #votoRacconto
                    //voto = voto.replace(' ', ''); //elimina spazi
                    voto = voto.split(','); //separa nomeConcorso da nomeRacconto
                    let nameConcorso = voto[0]; //ottieni concorso di riferimento
                    let nameRacconto = voto[1]; //ottieni racconto corrente
                    console.log("Aggiungo voto a " + nameRacconto);
                    if (nameRacconto.charAt(0) == " ") {
                        nameRacconto = nameRacconto.substr(1);
                    }
                    console.log("Aggiungo voto a " + nameRacconto);
                    insertVoto(nameConcorso, nameRacconto); //inserisci il voto in hashmap "concorsi"
                }
            }
            createGrapichs();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

//funzioe che incrementa il voto di ogni racconto corrispondente al concorso
function insertVoto(concorso, racconto) { //voto è il nome del racconto...
    if (concorsi.has(concorso)) { //concorso già inserito precedentemente --> si può inserire il racconto
        let racconti = concorsi.get(concorso); //estrae value di concorsi --> l'hashmap dei racconti
        if (racconti.has(racconto)) {
            let votes = racconti.get(racconto); // prende il value cioè i voti di racconto
            votes = votes + 1; //incrementa di 1
            console.log(votes);
            racconti.set(racconto, votes); // reinserisce il racconto con value aggiornato
            concorsi.set(concorso, racconti); // reinserisce la lista di racconti aggiornata
        } else {
            console.log(racconto);
        }
    }
}

function drawTitle(key) {
    var title = document.createElement('div');
    title.id = "title_" + key;
    title.className = "title";
    title.innerHTML = key;
    document.getElementById('container_concorso').appendChild(title);
}

//funzione che crea a partire dalle hashmap i dati da passare al istogramma per essere creato
function createGrapichs() {
    console.log(votiUtente);
    let list = []; //lista che, dato un concorso key, conterrà coppie-oggetti del tipo "nome-racconto/voti-racconto"
    let i = 0;
    for (let [key] of concorsi) {
        let racconti = concorsi.get(key); //ottieni hashmap racconti corrispodente ad un certo concorso
        for (let [key2, value2] of racconti) { //analizza i singoli racconti
            let obj = { "name": key2, "value": value2 };
            list.push(obj); //crea un oggetto con le info del singolo racconto
        }
        drawTitle(key);
        drawIstogram(list, i, key); //dato il concorso key, disegna il grafico ad istogramma con i dati dei racconti corrispondenti
        drawDonut(list, i, key); //dato il concorso key, disegna il grafico ad ciambella con i dati dei racconti corrispondenti
        i++; //passa ad analizzare il racconto successivo
        list = []; //pulisce la lista dei parametri
    }
}