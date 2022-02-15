let geoCoordinates = [];

async function getTravelSpyData() {
    if (geoCoordinates) geoCoordinates.length = 0;
    return new Promise(async function(resolve, reject) {
        await getUserTweet().then(() => {
            console.log(geoCoordinates);
            resolve(geoCoordinates);
        }).catch(err => {
            reject(err);
        });
    })
}

function getUserTweet() {
    var text = document.getElementById('search').value;
    if (text.charAt(0) === "@") { text = text.substr(1); }
    //url = "http://localhost:8000/searchbyUser/" + text + "/mixed/100";
    url = "http://localhost:8000/searchbyUser/" + text + "/mixed/50";
    return new Promise(async function(resolve, reject) {
        await $.ajax({
            type: 'GET',
            url: url,
            crossDomain: true,
            success: function(data) {
                if (data.data) {
                    console.log(data.data);
                    Loop(data.data).then(() => {
                        resolve(data);
                    })
                } else {
                    reject("User not found");
                }
            },
            error: function(err) {
                refuse()
                reject(err);
            }
        }).catch(err => {
            reject(err);
        });
    })
}

function refuse() {
    return new Promise(async function(resolve, reject) {
        reject("no user found");
    }).catch(err => {
        return (err);
    });
}

function Loop(data) {
    console.log("eccomi");
    return new Promise(async function(resolve, reject) {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            console.log(("yo"));
            let x = await tweetGeo(data[i].id).then(function(result) {
                geoCoordinates.push(result);
                console.log(result);
            }).catch(err => {
                console.log("ciao");
                reject(err);
            });
        }
        resolve(data);
    })
}

function tweetGeo(id) {
    //let url2 = 'http://localhost:8000/tweetById/' + id;
    let url2 = "http://localhost:8000/tweetById/" + id;
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'GET',
            url: url2,
            crossDomain: true,
            success: function(data2) {
                console.log(data2);
                resolve(data2);
            },
            error: function(err) {
                reject(err);
            }
        })
    })
}