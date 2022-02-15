function func() {
    $("#space").empty();
    $("#chart_isto_section").empty();
    $("#ppprova").empty();

    if (!document.getElementById("loadingCircle")) {
        var loadingDiv = document.getElementById("loading1");
        let div = document.createElement("div");
        div.id = "loadingCircle";
        loadingDiv.appendChild(div);
        let div2 = document.createElement("div");
        div2.id = "loadingText";
        div2.innerHTML = "Loading"
        loadingDiv.appendChild(div2);
    }


    var text = document.getElementById('search').value;
    var searchby = document.querySelector('input[name="searchby"]:checked').value;
    var orderby = document.getElementById('order').value;
    var maxt = document.getElementById('num_tweet').value;
    var radius = document.getElementById('radius').value;


    if ((searchby === "searchHashtag" && text.charAt(0) === "#") || (searchby === "searchbyUser" && text.charAt(0) === "@")) {
        text = text.substr(1);
    }

    if (searchby === "searchbyUser") {
        let pattern = /^([A-Za-z0-9_]{1,15})$/
        if (!pattern.test(text)) {
            alert("nome utente invalido")
            text = "invalid";
        }
    }

    var url = "";
    if (document.getElementById('loc').checked) {
        url = 'http://localhost:8000/' + searchby + '/' + text + '/' + orderby + '/' + maxt + '/' + radius;
    } else {
        url = 'http://localhost:8000/' + searchby + '/' + text + '/' + orderby + '/' + maxt;
    }

    if (text !== "invalid") {
        $.ajax({
            type: 'GET',
            url: url,
            crossDomain: true,
            success: function(data) {
                if (data.data !== 0) {
                    if (data['statuses']) { //se i tweet non provengono da ricerca per username
                        print_on_map(data, text);
                        printCloud(data);
                        isto_tweet(data);
                        sentimentalAnalysis(data);
                        if (data.pos === 0 && data.neg === 0 && data.neu === 0) {
                            console.log("vuotissimo");
                            emptyPie();
                        } else {
                            console.log("pieno");
                            drawPie(data);
                        }
                    } else { //se provengono da ricerca per username ho solo id e text, devo quindi prima risalire a data dall'id
                        console.log(data);
                        callLoop(data, text);
                        //console.log("num tweets: "+data.length);
                    }
                    // per l'embedding dei tweet
                    var url_tweet;
                    var prova;
                    var scriptTweet;
                    var empty = 0;
                    if (data['statuses']) {
                        for (let status in data['statuses']) {
                            url_tweet = 'https://twitter.com/tweet/status/' + data['statuses'][status]['id_str'];
                            prova = `<blockquote class="twitter-tweet ourTweets">
                  <a href="${url_tweet}"></a> </blockquote>`;
                            $("#space").append(prova);
                            empty = empty + 1;
                        }
                        console.log("svuoto");
                        $("#loading2").empty();

                    } else {
                        for (let status in data.data) {
                            url_tweet = 'https://twitter.com/tweet/status/' + data.data[status]['id'];
                            prova = `<blockquote class="twitter-tweet ourTweets">
                    <a href="${url_tweet}"></a> </blockquote>`;
                            $("#space").append(prova);
                            empty = empty + 1;
                        }
                    }
                    show(empty);

                } else {
                    show(data.data);
                }

            },
            error: function(err) {
                console.log(err);
            }
        });
    } else {
        show(0);
    }
}

function show(num) {
    if (num === 0) {
        $("#loading1").empty();
        console.log("no");
        document.getElementById('grafici_iniziali').style.visibility = "hidden";
        document.getElementById('chart_isto_section').style.display = "none";
        $("#ppprova").append("Non sono stati trovati tweet relativi a tale ricerca");
    } else {
        console.log("si");
        document.getElementById('grafici_iniziali').style.visibility = "visible";
        document.getElementById('chart_isto_section').style.display = "inline";
        scriptTweet = `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
        $("#space").append(scriptTweet);
    }
}

let tweets = [];

async function callLoop(data, text) {
    for (let status in data.data) {
        if (data.data[status]['id']) {
            await get_data_from_id(data.data[status]['id']);
        }
    }
    let fakeData = { "statuses": tweets };
    console.log(fakeData);
    printCloud(fakeData);
    isto_tweet(fakeData);
    sentimentalAnalysis(data.sentiment);
    if (data.sentiment.pos === 0 && data.sentiment.neg === 0 && data.sentiment.neu === 0) {
        console.log("vuotissimo");
        emptyPie();
    } else {
        console.log("pieno");
        drawPie(data.sentiment);
    }
    print_on_map(fakeData, text);
    console.log("svuoto");
    $("#loading2").empty();
    tweets = [];
}

async function get_data_from_id(id) {
    url = 'http://localhost:8000/tweetById/' + id;

    await $.ajax({
        type: 'GET',
        url: url,
        crossDomain: true,
        success: function(data) {
            //console.log(data);
            tweets.push(data);
            returnPromise(true, data);
        },
        error: function(err) {
            console.log(err);
            returnPromise(false);
            reject(err);
        }
    })
}

function returnPromise(value, data) {
    if (value) {
        return Promise.resolve(data);
    } else {
        return Promise.reject("Error");
    }
}

function sentimentalAnalysis(data) {
    var pos = data.pos;
    var neg = data.neg;
    var neu = data.neu;
    var unk = data.unk;
    console.log(pos, neg, neu, unk);

    if (pos === 0 && neg === 0 && neu === 0) {
        document.getElementById("result").innerHTML = "sentiment undefined";
        document.getElementById("imgEmoji").src = "img/emoji/bho.png";
    } else if (pos >= neg && pos >= neu) {
        document.getElementById("result").innerHTML = "positivo";
        document.getElementById("imgEmoji").src = "img/emoji/happy.png";
    } else if (neg >= pos && neg >= neu) {
        document.getElementById("result").innerHTML = "negativo";
        document.getElementById("imgEmoji").src = "img/emoji/sad.png";
    } else {
        document.getElementById("result").innerHTML = "neutro";
        document.getElementById("imgEmoji").src = "img/emoji/neutral.png";
    }
}