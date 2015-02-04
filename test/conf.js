// conf.js

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['spec.js'],
    multiCapabilities: [
    /*    {
        browserName: 'firefox'
    }
    */
    /*    ,*/
        {
        browserName: 'chrome'
    }
    ]
}