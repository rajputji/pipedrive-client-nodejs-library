const { Controller } = require("../lib");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

app.get('/', (req, res) => {
    res.send('This is a sample test application for pipedrive nodejs library!')
})

app.listen(port, () => {
    console.log(`pipedrive library test client is listeneing at http://localhost:${port}`)
});



/**
 * search person by name/id.
 *
 * @param  {number} id id of person to look for
 * 
 * @param  {string} name name of person to look for
 *
 * @returns {Object} API response
 */

app.get('/persons/search', (req, res) => {
    console.log(req.query);

    if (req.query.id && Number(req.query.id)) {
        Controller.searchPersonById(req.query.id).then(
            r => res.send(r),
            e => res.send(e)
        )
    }
    else {
        Controller.searchPersonsByName(req.query.name).then(
            r => res.send(r),
            e => res.send(e))
    }
})

/**
 * update the person identified by id.
 *
 * @param  {number} id id of person as path param
 * 
 * @param  {string} name update name as json object in body
 *
 * @returns {Object} API response
 */

app.put('/persons/:id', jsonParser, (req, res) => {

    const input = {
        id: req.params.id,
        name: req.body.name
    }

    Controller.updatePerson(input).then(
        r => res.send(r),
        e => res.send(e)
    )
});

/**
  * Adds Note to the Person identified by req.body.person_id.
  *
  * @param  {Object} req.body Object with person_id and note_content
  * 
  * @param {number} req.body.person_id id of the person
  * 
  * @param {string} req.body.note_content Content of note to be added
  *
  * @returns {Object} API response
*/
app.post('/notes/', jsonParser, (req, res) => {
    console.log(req.body);
    Controller.addNoteToPerson(req.body).then(
        r => res.send(r),
        e => res.send(e)
    )
});

/**
  * Creates webhook 
  * 
  * @param {string} req.body.url URL to be registered to webhook for person created/updated
  *
  * @returns {Object} API response
*/
app.post('/webhooks/', jsonParser, (req, res) => {
    console.log(req.body);
    Controller.createWebhook(req.body.url).then(
        r => res.send(r),
        e => res.send(e)
    )
});


/**
  * Test the webhook functionality
  * 
  * @param {Object} req.body complete webhook notification response
  *
  * @returns {Object} Person Details Object
*/
app.post('/webhooks/test', jsonParser, (req, res) => {
    Controller.getPersonDetailsOnWebhookHit(req.body).then(
        r => res.send(r),
        e => res.send(e)
    )
});