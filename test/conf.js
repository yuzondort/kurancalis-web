// conf.js

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

exports.config = {
    // seleniumAddress: 'http://localhost:4444/wd/hub',
    directConnect: true,
    specs: [
        'spec1.js',
        'temiz.js',
        'spec2.js',
        'spec3.js',//spec2 ile birlikte çalışmalıdır.
        'spec4.js',
        'spec5.js',
        'spec6.js',
        'spec7.js',
        'spec8.js',
        'spec9.js',
        'temiz.js',
        'spec10.js'
    ],
    jasmineNodeOpts: {defaultTimeoutInterval: 360000},
    multiCapabilities: [
    /*    {
        browserName: 'firefox'
    }
    */
    /*    ,*/
        {
        browserName: 'chrome'
    }
    ],
    onPrepare: function() {
        browser.manage().window().setSize(1300, 760);
    }
}