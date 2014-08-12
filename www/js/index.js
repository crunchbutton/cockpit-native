var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	Update.init();
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};



var Update = {
	fs: null,
	build: [],
	init: function() {
		var error = function() {
			console.log('ERROR',arguments);
		};
		var success = function(fs) {
			console.log('SUCCESS',arguments);
			Update.fs = fs;
		};
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
	},
	read: function(file) {
		var reader = new FileReader();
		reader.onloadend = function (evt) {
			console.log("read success");
			console.log(evt.target.result);
		};
		reader.readAsText(file);
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
			Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
				fn(file);
			}, fail);
		};
		
		var updateBuild = function(fn) {
			Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(fileEntry) {
				gotFileEntry(fileEntry, fn);
			}, fail);
		};
		
		var update = function() {
			console.debug('UPDATEING');
			console.log(Update.build.remote);
		};
		
		var checkBuild = function() {
			currentBuild(function(build) {
				if (build) {
					console.log(build);
					Update.build.local = JSON.parse(Update.read(build));
				}

				updateBuild(function(build) {
					Update.build.remote = JSON.parse(Update.read(build));
					
					if (!Update.build.local || !Update.build.local.version || Update.build.local.version != Update.build.remote.version) {
						update();
					}
				});
			});
		};
		
		checkBuild();
		

		
		

		
    }
};
