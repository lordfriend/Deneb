/**
 * @author: @AngularClass
 */
const fs = require('fs');
const helpers = require('./config/helpers');

/**
 * check custom login style exists
 */

let loginStyleExsits;
try {
    loginStyleExsits = fs.statSync(helpers.root('src/assets/css/login.css')).isFile();
    console.log('login style file existence: ' + loginStyleExsits);
} catch (e) {
    console.error('no login style file found, use default');
    loginStyleExsits = false;
}

const ENV = process.env.ENV = process.env.NODE_ENV;
/**
 * Webpack Constants
 */
const METADATA = {
    host: '0.0.0.0',
    port: 3000,
    title: process.env.SITE_TITLE || 'Deneb',
    baseUrl: '/',
    GA: process.env.GA || '',
    customLoginStyle: loginStyleExsits,
    chrome_extension_id: process.env.CHROME_EXTENSION_ID || '',
    firefox_extension_id: process.env.FIREFOX_EXTENSION_ID || '',
    edge_extension_id: process.env.EDGE_EXTENSION_ID || '',
    firefox_extension_url: process.env.FIREFOX_EXTENSION_URL || '',
};

console.log('CHROME_EXTENSION_ID: ', METADATA.chrome_extension_id);


// Look in ./config folder for webpack.dev.js
switch (ENV) {
    case 'prod':
    case 'production':
        METADATA.port = process.env.PORT || 8080;
        METADATA.ENV = ENV || 'production';
        METADATA.HMR = false;
        module.exports = require('./config/webpack.prod')(METADATA);
        break;
    // case 'test':
    // case 'testing':
    //     METADATA.ENV = ENV || 'test';
    //     module.exports = require('./config/webpack.test')(METADATA);
    //     break;
    case 'dev':
    case 'development':
    default:
        METADATA.ENV = ENV || 'development';
        METADATA.HMR = true;
        module.exports = require('./config/webpack.dev')(METADATA);
}
