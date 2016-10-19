/**
 * Created by githop on 1/2/16.
 */

import request from 'request';

const doRequest = (options) => {
    return new Promise(
        (resolve, reject) => {
            request(options, (error, resp, body) => {
                if (!error && resp.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject({error, body});
                }
            });
        }
    );
};

const envs = {
    API_DEV: {
        USERNAME: process.env.USERNAME,
        URL: 'https://api-dev.inthetelling.com',
        PASSWORD: process.env.API_DEV_PASSWORD
    },
    LOCALHOST: {
        USERNAME: process.env.USERNAME,
        URL: process.env.VHOST,
        PASSWORD: process.env.LOCALHOST_PASSWORD
    },
    DEMO: {
        USERNAME: process.env.USERNAME,
        URL: 'https://demo.inthetelling.com',
        PASSWORD: process.env.DEMO_PASSWORD
    },
    STORY: {
        USERNAME: process.env.USERNAME,
        URL: 'https://story.inthetelling.com',
        PASSWORD: process.env.STORY_PASSWORD
    }
};

const paths = {
    LOGIN: '/auth/identity/callback',
    TEST: '/v3/narratives/',
    TEMPLATES: '/v1/templates'
};

const switchEnv = (e) => {
    let env;
    const localhost = () => {
        return env = envs.LOCALHOST;
    };

    const apiDev = () => {
        return env = envs.API_DEV;
    };

    const demo = () => {
        return env = envs.DEMO;
    };

    const story = () => {
        return env = envs.STORY;
    };

    let _envs = {
        'localhost': localhost,
        'api-dev': apiDev,
        'demo': demo,
        'story': story,
        'default': localhost
    };

    (_envs[e] || _envs['default'])();
    return env;
};

const handleInput = (args) => {

    let argsObj = {
        url: args.url,
        name: args.name || 'default'
    };

    console.log("args!", args);
    //require URL
    if (args.url === undefined) {
        throw new Error('URL path is required!');
    }

    if (args.applies_to_episodes=== undefined) {
        throw new Error('applies_to_episodes field is required!');
    }

    //check for scene

    if (args.applies_to_episodes !== undefined && args.applies_to_episodes === 'true') {
        argsObj.applies_to_episodes= true;
    }

    if (args.applies_to_episodes !== undefined && args.applies_to_episodes=== 'false') {
        argsObj.applies_to_episodes= false;
    }

    if (args.seed_template !== undefined && args.seed_template === 'true') {
        argsObj.seed_template = true;
    }

    if (args.seed_template !== undefined && args.seed_template === 'false') {
        argsObj.seed_template = false;
    }

    if (args.event_types !== undefined) {
        argsObj.event_types = [args.event_types];
    }


    return argsObj;

};


export { doRequest, switchEnv, paths, handleInput };
