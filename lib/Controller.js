
const executeRequest = require('./HttpClient');

class Controller {

    /**
      * Searches all Persons by name.
      * 
      * @param {string} name search term to look for in name field
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static searchPersonsByName(name, callback) {

        const path = '/persons/search';
        const URL = `${path}?term=${name}&fields=name`;

        const options = {
            url: URL,
            method: 'GET',
        };

        return executeRequest(options, callback);
    }

    /**
      * finds a person by id.
      *
      * @param  {number} id ID of person to look for
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static searchPersonById(id, callback) {

        const path = `/persons/${id}`;
        const URL = `${path}`;

        const options = {
            url: URL,
            method: 'GET',
        };

        return executeRequest(options, callback);
    }

    /**
      * Updates the Person identified by id.
      *
      * @param  {array}  input Object with updated data
      * 
      * @param {string} input ['id'] id of the person
      * 
      * @param {string} input ['name'] updated name of the person
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static updatePerson(input, callback) {

        const path = `/persons/${input.id}`;
        const URL = `${path}`;

        const options = {
            url: URL,
            method: 'PUT',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({
                name: input.name
            })
        };

        return executeRequest(options, callback);
    }

    /**
      * Adds Note to the Person identified by input.person_id.
      *
      * @param  {Object} input Object with person_id and note_content
      * 
      * @param {number} input.person_id id of the person
      * 
      * @param {string} input.note_content Content of note to be added
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static addNoteToPerson(input, callback) {

        const path = `/notes`;
        const URL = `${path}`;

        const options = {
            url: URL,
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify(input)
        };

        return executeRequest(options, callback);
    }

    /**
      * creates webhook for person created/updated events
      *
      * @param  {string} url URL to be registered in webhook
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static createWebhook(url, callback) {

        const path = `/webhooks`;
        const URL = `${path}`;

        const options1 = {
            url: URL,
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({
                subscription_url: url,
                event_action: "added",
                event_object: "person"
            })
        };

        const options2 = {
            url: URL,
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({
                subscription_url: url,
                event_action: "updated",
                event_object: "person"
            })
        };
        return Promise.all([executeRequest(options1, callback), executeRequest(options2, callback)]);
    }


    /**
      * get Person Details on webhook hit
      *
      * @param  {Object} webhook_notification_body Body recieved from webhook
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static getPersonDetailsOnWebhookHit(webhook_notification_body, callback) {

        callback = typeof callback === 'function' ? callback : () => undefined;

        return new Promise((resolve, reject) => {
            this.searchPersonById(webhook_notification_body.current?.id)
                .then(personDetails => {
                    personDetails = JSON.parse(personDetails);
                    this.getPersonFieldsKey("SIQ Stop").then(key => {
                        let response = {
                            "action": webhook_notification_body.meta?.action,
                            "person": personDetails.data
                        };
                        response.person["SIQ Stop"] = response.person[key] == "Yes";
                        callback(null, { "body": response }, response);
                        resolve(response);
                    })
                })
                .catch(error => {
                    callback(error, null, null);
                    reject(error);
                })
        })
    }


    /**
      * get Key for the custom Person field
      * 
      * @param  {String} custom_field_name Custom Field Name
      * 
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static getPersonFieldsKey(custom_field_name) {

        return new Promise((resolve, reject) => {
            this.getPersonFieldsKeyValue()
                .then(res => {
                    res = JSON.parse(res);
                    let keyValue = res.data.find(_r => _r.name == custom_field_name) || { key: "", name: custom_field_name };
                    resolve(keyValue.key);
                })
                .catch(error => {
                    reject(error);
                })
        });
    }


    /**
      * get PersonFields in Key Value Format
      *
      * @callback The callback function that returns response from the API call
      *
      * @returns {Promise}
      */
    static getPersonFieldsKeyValue(callback) {
        const options = {
            url: '/personFields:(key,name)/',
            method: 'GET',
            headers: {
                "Content-Type": 'application/json',
            }
        };
        return executeRequest(options, callback);
    }


}

module.exports = Controller;