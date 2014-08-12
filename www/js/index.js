
var App = {
	fs: null,
	build: [],
	init: function() {
		var error = function() {
			console.log('ERROR',arguments);
		};
		var success = function(fs) {
			console.log('SUCCESS',arguments);
			App.fs = fs;
		};
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
	},
    clicky: function() {
    	var server = 'http://cockpit3.localhost/';
    	
    	var fail = function() {
	    	console.log(arguments);
    	};

		var downloadError = function(error) {
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("download error code: " + error.code);
			console.log(error);
		};
		
		var downloadComplete = function(file, fn) {
			console.log("download complete: " + file.toURL());
			fn(file);
		};
		
		var gotFileEntry = function(fileEntry, fn) {
			var fileTransfer = new FileTransfer();
			fileEntry.remove();
			fileTransfer.download(server + 'api/build', fileEntry.toURL(), function(file) {
				downloadComplete(file, fn);
			}, downloadError);
		};

		var currentBuild = function(fn) {
			App.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
				fn(file);
			}, fail);
		};
		
		var updateBuild = function(fn) {
			App.fs.root.getFile('build.json', {create: true, exclusive: false}, function(fileEntry) {
				gotFileEntry(fileEntry, fn);
			}, fail);
		};
		
		var update = function() {
			console.debug('UPDATEING');
			console.log(App.build.remote);
		};
		
		var checkBuild = function() {
			currentBuild(function(build) {
				App.build.local = JSON.parse(build);

				updateBuild(function(build) {
					App.build.remote = JSON.parse(build);
					
					if (!App.build.local || !App.build.local.version || App.build.local.version != App.build.remote.version) {
						update();
					}
				});
			});
		};
		
		checkBuild();
		

		
		

		
    }
};
