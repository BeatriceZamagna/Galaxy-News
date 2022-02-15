window.onload = function() {
    //loadingCircle();
    getUrl();
}

function loadingCircle() {
    var loadingDiv = document.getElementById("loading");
    let div = document.createElement("div");
    div.id = "loadingCircle";
    loadingDiv.appendChild(div);
    let div2 = document.createElement("div");
    div2.id = "loadingText";
    div2.innerHTML = "Loading tweets"
    loadingDiv.appendChild(div2);
    console.log("fatto");
}

function getUrl() {
    let url = window.location.href
    url = url.split('/');
    url = url[url.length - 1];
    url = url.split('$');
    var key = url[0];
    console.log(key);
    var mode = url[1];
    var text = url[2];
    var orderby = url[3]
    var maxt = url[4]
    var radius = url[5];
    //console.log(key+","+mode+","+text+","+orderby+","+maxt+","+radius);
    let data = getTweet(mode, text, orderby, maxt, radius);
    let id_list = getTweetByPlace(data, key);
    renderTweet(id_list);
}

function getTweet(mode, text, orderby, maxt, radius) {
    if (text.charAt(0) === "@") { text = text.substr(1); }
    var url = "";
    if (mode == "searchLocation") {
        url = 'http://localhost:8000/' + mode + '/' + text + '/' + orderby + '/' + maxt + '/' + radius;
    } else {
        url = 'http://localhost:8000/' + mode + '/' + text + '/' + orderby + '/' + maxt;
    }
    let tmpData;

    $.ajax({
        type: 'GET',
        url: url,
        crossDomain: true,
        async: false,
        success: function(data) {
            console.log(data)
            tmpData = data;
        },
        error: function(err) {
            console.log(err);
        }
    });
    return tmpData;
}

function getTweetByPlace(data, key) {
    let id_list = []
    if (data['statuses']) {
        for (let status in data['statuses']) {
            if (data['statuses'][status]['place']) console.log(data['statuses'][status]['place']['id'], key);
            if (data['statuses'][status]['place'] && data['statuses'][status]['place']['id'] == key) {
                id_list.push(data['statuses'][status]['id_str']);
            }
        }
    } else {
        if (data.data) {
            for (let t in data.data) {
                if (data.data[t].geo) {
                    if (data.data[t].geo.place_id == key) {
                        id_list.push(data.data[t].id);
                    }
                }
            }
        }
    }
    console.log(id_list);
    return id_list;
}

function renderTweet(id_list, cont, length) {
    for (let id in id_list) {
        console.log(id);
        var url_tweet = 'https://twitter.com/tweet/status/' + id_list[id];
        console.log(url_tweet);
        var prova = `<blockquote class="twitter-tweet ourTweets">
      <a href="${url_tweet}"></a> </blockquote>`;
        $("#space").append(prova);
    }
    var loadingDiv = document.getElementById("loading");
    loadingDiv.parentNode.removeChild(loadingDiv);
    console.log("elimino");
    var scriptTweet = `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
    $("#space").append(scriptTweet);
    console.log("funziona");
}