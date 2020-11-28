let config = {};

config.folders = [{
    name:'embeddables',
    yapexil:'embeddables/',
    mef_img: 'images/',
    mef_other: 'problemroot/'
    },
    {
    name:'statements',
    yapexil:'statements/',
    mef: ''
},{
    name:'tests',
    yapexil:'tests/',
    mef: 'tests/'
},
    {
        name:'solutions',
        yapexil:'solutions/',
        mef: 'solutions/'
    },
    {
        name:'skeletons',
        yapexil:'skeletons/',
        mef: 'skeletons/'
    }
];

config.imageExtensions = 'jpg bmp jpeg tif png';

module.exports = config;