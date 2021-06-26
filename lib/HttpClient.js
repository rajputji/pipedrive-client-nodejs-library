
const request = require('request');
const config = require('./config');

const baseURL = config.baseURL;
const apiToken = config.apiToken;


function appendApiTokenToURL(url) {
    let separator = '?'
    if (url.indexOf('?') > -1) separator = '&';
    return `${url}${separator}api_token=${apiToken}`
}

function executeRequest(options, callback) {

    callback = typeof callback === 'function' ? callback : () => undefined;

    if (options.url) {
        let requestURL = `${baseURL}${options.url}`
        options.url = appendApiTokenToURL(requestURL);
    }

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            try {
                if (error) {
                    throw new Error(error);
                }
                else if (response.statusCode >= 200 && response.statusCode <= 206) {
                    callback(error, response, body);
                    resolve(body);
                }
                else {
                    callback(error, response, body);
                    reject(error);
                }
            }
            catch (error) {
                callback(error, response, body);
                reject(error);
            }
        });
    })
}

module.exports = executeRequest;
