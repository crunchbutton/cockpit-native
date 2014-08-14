#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	sys = require('sys'),
	exec = require('child_process').exec,
	rootdir = process.argv[2],
	dst = path.join(rootdir, 'platforms/ios/Cockpit/Resources/splash/');


var color = '202228';

var splash = [
	{'size': [320, 480], 'name': 'Default~iphone'},
//	{'size': [480, 320], 'name': 'Default-Landscape~iphone'},
	{'size': [768, 1024], 'name': 'Default-Portrait~ipad'},
	{'size': [1024, 768], 'name': 'Default-Landscape~ipad'},
//	{'size': [640, 960], 'name': 'Default-568h@2x~iphone'},
	{'size': [640, 960], 'name': 'Default@2x~iphone'},
	{'size': [960, 640], 'name': 'Default-Landscape@2x~iphone'},
//	{'size': [639, 1136], 'name': 'Default-568h@2x~iphone'},
	{'size': [1536, 2016], 'name': 'Default-Portrait@2x~ipad'},
	{'size': [2048, 1536], 'name': 'Default-Landscape@2x~ipad'}
];



 
splash.forEach(function(obj) {

	var file = path.join(dst, obj.name);
	var cmd = 'convert -size ' + obj.size[0] + 'x' + obj.size[1] + ' canvas:#' + color + ' ' + file + '.png';

	child = exec(cmd, function (error, stdout, stderr) {
		console.log(stderr);
	});
});
