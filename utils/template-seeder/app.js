/**
 * Created by githop on 1/2/16.
 */

import co from 'co';
import prettyjson from 'prettyjson';
import { doRequest, switchEnv, paths, handleInput } from './utils';

const argv = require('yargs').argv;
const currentEnv = switchEnv(argv.env);
const baseUrl = currentEnv.URL;
const formfields = handleInput(argv);

main();

function main() {

    const existy = (x) => x != null;

    const pick = (obj, arr) => {
        return arr.reduce(function(accm, field) {
            if (existy(obj[field])) {
                accm[field] =  obj[field];
            }
            return accm;
        }, {});
    };

    const formatOpts = (url, method, headers, opts) => {
        let params = {
            url: baseUrl + url,
            method: method || 'GET',
            headers: headers || {}
        };
        Object.assign(params, opts);
        return params;
    };

    const login = () => {
        let loginOpts = formatOpts(
            paths.LOGIN,
            'POST',
            {},
            {form: {auth_key: currentEnv.USERNAME, password: currentEnv.PASSWORD} }
        );
        return doRequest(loginOpts);
    };

    const getIndex = (t) => {
        var props = pick(formfields, ['url', 'name', 'applies_to_episodes', 'event_types']);
        let testOpts = formatOpts(
            paths.TEMPLATES,
            'GET',
            {'Authorization': `Token token=${t.access_token}`, 'Content-type': 'application/json'},
            {form: props}
        );
        return doRequest(testOpts);
    };

    const postTemplate = (t) => {
        var props = pick(formfields, ['url', 'name', 'applies_to_episodes', 'event_types']);
        let postOpts = formatOpts(
            paths.TEMPLATES,
            'POST',
            {'Authorization': `Token token=${t.access_token}`, 'Content-type': 'application/json'},
            {body: props, json: true}
        );
        return doRequest(postOpts);
    };

    return co(function *() {

        console.log("formatted args", formfields);
        let authToken = yield login();
        let response;
        if (formfields.seed_template === true) {
            response  = yield postTemplate(authToken);
        } else {
            response = yield getIndex(authToken);
        }

        console.log(prettyjson.render(response, {}));
    }).catch((e) => {
        console.log('err', e);
    });
}


