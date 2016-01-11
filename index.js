var util = require('./util.js'),
    pickInputs = {
        'id': { key: 'id', validate: { req: true }}
    }, pickOutputs = {
        id: { key: 'comments', fields: ['id'] },
        body: { key: 'comments', fields: ['body'] },
        public: { key: 'comments', fields: ['public'] },
        author_id: { key: 'comments', fields: ['author_id'] },
        attachments: { key: 'comments', fields: ['attachments'] },
        via: { key: 'comments', fields: ['via'] },
        metadata: { key: 'comments', fields: ['metadata'] },
        created_at: { key: 'comments', fields: ['created_at'] }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('zendesk_token'),
            username = dexter.environment('zendesk_username'),
            subdomain = dexter.environment('zendesk_subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [zendesk_token,zendesk_username,zendesk_subdomain] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        var request = require('request').defaults({
            baseUrl: 'https://' + subdomain + '.zendesk.com/api/v2/'
        });

        request.get({
            uri: '/tickets/' + inputs.id + '/comments.json',
            auth: {
                user: username.concat('/token'),
                pass: token
            },
            json: true
        }, function (err, response, result) {
            if (err || (result && result.error))
                this.fail(err || result);
            else
                this.complete(util.pickOutputs(result, pickOutputs));
        }.bind(this));
    }
};
