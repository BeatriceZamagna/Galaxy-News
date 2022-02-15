function get_v2key() {
    const { TwitterApi } = require('twitter-api-v2')
    const client = new TwitterApi('');
    return client.readOnly;
}

module.exports = get_v2key;