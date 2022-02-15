const express = require('express');
const cors = require('cors');
const path = require('path');

const needle = require('needle');
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const { TwitterApi, ETwitterStreamEvent, TweetStream, ETwitterApiError } = require('twitter-api-v2');

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream'

const twit = require('twit');
const get_v2key = require('./v2_key');
const app = express();

const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })

const Languages = require('languages.io')
const language = new Languages()
const sentiment = require('multilang-sentiment');

const languages_list = ["af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "ceb", "co", "cs", "cy", "da", "de", "el", "en", "eo", "es", "et", "eu", "fa", "fi", "fr", "fy", "ga", "gd", "gl", "gu", "ha", "haw", "hi", "hmn", "hr", "ht", "hu", "hy", "id", "ig", "is", "it", "iw", "ja", "jw", "ka", "kk", "km", "kn", "ko", "ku", "ky", "la", "lb", "lo", "lt", "lv", "mg", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "ne", "nl", "no", "ny", "pa", "pl", "ps", "pt", "ro", "ru", "sd", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "tl", "tr", "uk", "ur", "uz", "vi", "xh", "yi", "yo", "zh-tw", "zh", "zu"];

var tweet = new twit({
    consumer_key: 'GXjIK3tlYbKyH9DVvaMg1VRMb',
    consumer_secret: 'xPJZaBH5CxKTaSwBOlLTkyyRGqKQGwrkuQ6KEC6bwh42EQP7CW',
    access_token: '1424820092634910722-WYfxYxYDDsHMz4BzWd4nNaEOv5sbBf',
    access_token_secret: 'TsFSQIC03w3NJSw2W4exfqAZkasOwkhDLscDPgfgYWD7L',

})

var stream = '';

var client = get_v2key()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')
app.engine('mustache', require('hogan-middleware').__express)
app.use(express.static(path.join(__dirname, 'static')))
app.use(cors())

app.get('/', (req, res, err) => {
    res.redirect('/home')
})

app.get('/home', (req, res, err) => {
    res.render('TwitterHome', null)
})

app.get('/team', (req, res, err) => {
    res.render('team', null)
})

app.get('/concorso', (req, res, err) => {
    res.render('concorso', null)
})

app.get('/trivia', (req, res, err) => {
    res.render('trivia', null)
})

app.get('/travelSply', (req, res, err) => {
    res.render('travelSpy', null)
})

app.get('/newPage/:value', (req, res, err) => {
    res.render('newPage', null)
})

function getSentiment(data) {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let unknown = 0

    if (data && data["statuses"]) {
        for (let status in data['statuses']) {
            let text = data['statuses'][status]['text'];
            let lang = language.recognize(text).ISO639_1

            if (languages_list.includes(lang)) {
                let analyzed = sentiment(text, lang);
                let category = analyzed.category;

                if (category === 'positive') positive++;
                else if (category === 'negative') negative++;
                else neutral++;
            } else {
                unknown++;
            }
        }
    } else if (data) {
        for (let status in data) {
            let text = data[status]['text'];
            let lang = language.recognize(text).ISO639_1

            if (languages_list.includes(lang)) {
                let analyzed = sentiment(text, lang);
                let category = analyzed.category;

                if (category === 'positive') positive++;
                else if (category === 'negative') negative++;
                else neutral++;
            } else {
                unknown++;
            }
        }
    }

    return { pos: positive, neg: negative, neu: neutral, unk: unknown };

}

app.get('/searchText/:text/:orderby/:maxt', (req, res, err) => {
    let params = req.params.text
    let order = req.params.orderby
    let max = req.params.maxt

    tweet.get('search/tweets', { q: params, count: max, result_type: order, }, function(err2, data, response) {
        var sentimentalResults = getSentiment(data);
        var dataTot = Object.assign({}, data, sentimentalResults)

        res.status(200).json(dataTot)
    })
})

app.get('/searchHashtag/:text/:orderby/:maxt', (req, res, err) => {
    let params = '#' + req.params.text
    let order = req.params.orderby
    let max = req.params.maxt
    tweet.get('search/tweets', { q: params, count: max, result_type: order }, function(err2, data, response) {
        var sentimentalResults = getSentiment(data);
        var dataTot = Object.assign({}, data, sentimentalResults)

        res.status(200).json(dataTot)
    })
})

app.get('/searchbyUser/:username/:orderby/:maxt', async(req, res, err) => {
    let params = req.params.username
    let max = req.params.maxt
    if (params.indexOf(' ') === -1) {
        try {
            var userTweet
            let user = client.v2.userByUsername(params).then(
                async(data) => {
                    console.log(data);
                    if (data.data) {
                        userTweet = await client.v2.userTimeline(data.data.id, { max_results: max, expansions: 'geo.place_id' })
                        var sentimentalResults = getSentiment(userTweet._realData.data);
                        var dataTot = Object.assign({}, userTweet._realData.data, sentimentalResults)
                        let obj = { data: userTweet._realData.data, sentiment: sentimentalResults }

                        res.status(200).json(obj);
                    } else {
                        console.log("no tweet");
                        let err = { data: 0 };
                        res.status(200).json(err)
                    }
                }
            )
        } catch (error) {
            console.log(error)
        }
    }
})

app.get('/searchLocation/:location/:orderby/:maxt/:radius', (req, res, err) => {
    let params = req.params.location
    let max = req.params.maxt
    let raggio = req.params.radius;
    tweet.get('geo/search', { query: params }, function(err2, data, response) {
        if (data["result"] && data["result"]["places"] && data["result"]["places"][0]) {
            let long = data["result"]["places"][0]["centroid"][0]
            let lat = data["result"]["places"][0]["centroid"][1]
            let geo = lat + "," + long + "," + raggio + "km";
            tweet.get('search/tweets', { q: "", geocode: geo, count: max }, function(err3, data1, response2) {
                var sentimentalResults = getSentiment(data1);
                var dataTot = Object.assign({}, data1, sentimentalResults)

                res.status(200).json(dataTot)
            })
        } else {
            console.log("Location not found");
            let err = { data: 0 };
            res.status(200).json(err)
        }

    })
})

app.get('/tweetById/:id', (req, res, err) => {
    let id = req.params.id
    tweet.get('/statuses/show/:id', { id: id }, function(err2, data, response) {
        res.status(200).json(data)
    })
})

//TRIVIA

app.get('/searchTrivia/:text/:orderby/:maxt', (req, res, err) => {
    let params = '#' + req.params.text
    let order = req.params.orderby
    let max = req.params.maxt
    tweet.get('search/tweets', { q: params, count: max, result_type: order, tweet_mode: 'extended' }, function(err2, data, response) {
        var sentimentalResults = getSentiment(data);
        var dataTot = Object.assign({}, data, sentimentalResults)

        res.status(200).json(dataTot)
    })
})

// STREAMING DEI TWEET
// abbiamo bisogno di tre funzioni per gestire le regole: getRules, setRues e deleteRules

//GET STREAM RULES
async function getRules() { // questa funzione mi permette di fare una richiesta a rulesURL di ottenere le regole attualemnete attive
    const response = await needle('get', rulesURL, { // with Needle you can use both promises and callbacks to perform HTTP requests.
        headers: {
            Authorization: `Bearer ${TOKEN}`
        },
    })
    return response.body;
}

app.get('/stream/closing', async(req, res) => {
    try {
        stream.close();
        res.status(200).json("Closed")
    } catch { res.status(401).json("Closed too soon") }
})

app.get('/stream/tweets', async(req, res) => {
    try {
        stream.close()
    } catch {
        console.log("No already opened stream found")
    }

    try {
        res.render('stream', null)

        //Aggiunge le regole
        await client.v2.updateStreamRules({
            add: [
                { value: 'traveltip', tag: 'TIP' },
                { value: 'traveltips', tag: 'TIP' },
                { value: 'travellife', tag: 'LIF' },
                { value: 'travelinsta', tag: 'INSTA' },
                { value: 'travelphotography', tag: 'PHOTO' },
                { value: 'TravelPhotography', tag: 'PHOTO' },
                { value: 'travelguide', tag: 'GUI' },
                { value: 'travelblog', tag: 'BLOG' },
                { value: 'cityscape', tag: 'CITY' },
                { value: 'travespot', tag: 'SPOT' },
                { value: 'travelinspiration', tag: 'INSP' },
                { value: 'travelroute', tag: 'ROUTE' },
                { value: 'europetravel', tag: 'EUR' },
                { value: 'asiatravel', tag: 'ASIA' },
                { value: 'usatravel', tag: 'USA' },
                { value: 'americatravel', tag: 'AME' },
                { value: 'hiddenbeauty', tag: 'HID' },
                { value: 'secretPlaces', tag: 'SEC' },
                { value: 'travlegram', tag: 'HID' },
                { value: 'travelblogger', tag: 'HID' },
                { value: 'travelIdeas', tag: 'HID' },
            ],
        });

        //Avvia la streaming
        stream = await client.v2.searchStream();

        //GESTORI DEGLI EVENTI DELLA STREAM
        // Awaits for a tweet
        stream.on(
            // Emitted when Node.js {response} emits a 'error' event (contains its payload).
            ETwitterStreamEvent.ConnectionError,
            err => console.log('Connection error!', err),
        );

        stream.on(
            // Emitted when Node.js {response} is closed by remote or using .close().
            ETwitterStreamEvent.ConnectionClosed,
            () => console.log('Connection has been closed.'),
        );

        stream.on(
            // Emitted when a Twitter sent a signal to maintain connection active
            ETwitterStreamEvent.DataKeepAlive,
            () => console.log('Twitter has a keep-alive packet.'),
        );

        stream.on(
            // Emitted when a Twitter payload (a tweet or not, given the endpoint).
            ETwitterStreamEvent.Data,
            async eventData => {
                //Emetto evento con socket.io per front-end
                await io.emit('tweet', eventData);
                console.log(eventData);
            }
        );

        // Enable reconnect feature
    } catch (e) {
        console.log("ERROR IN STREAM: ", e);
        res.status(404).json(e);
    }

    //let percorso = path.resolve(__dirname, 'stream.html')
    //res.sendFile(percorso);

    // io.on("connection", (socket) => {
    //     console.log('IO connected...')
    // });

});

module.exports = server;
