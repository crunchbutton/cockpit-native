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
	build: {},
	server: 'http://cockpit3.localhost/',
	path: 'assets/',
	force: true,

	init: function() {
		var error = function() {
			console.log('ERROR',arguments);
		};
		var success = function(fs) {
			console.log('SUCCESS',arguments);
			Update.fs = fs;
			Update.checkBuild();
		};
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
	},

	read: function(entry, fn) {
		console.log('reading',entry);
		
		var win = function(file) {
	
			var reader = new FileReader();
			reader.onloadend = function (evt) {
				console.log('read success');
				console.log(evt.target.result);
				fn(evt.target.result);
			};
			reader.readAsText(file);
		};
		
		var fail = function() {
			console.log('failed to access file');
			fn(null);
		};

		entry.file(win, fail);

	},
		
	checkBuild: function() {
		Update.currentBuild(function(build) {
			console.log('build',build);

			Update.read(build, function(res) {
				Update.build.local = JSON.parse(res);

				Update.updateBuild(function(build) {
					Update.read(build, function(res) {
						Update.build.remote = JSON.parse(res);

						if (Update.force || !Update.build.local || !Update.build.local.version || Update.build.local.version != Update.build.remote.version) {
							Update.update();
						}
					});
				});
			});

		});
	},
	
	updateBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(fileEntry) {
			Update.gotFileEntry(fileEntry, fn);
		}, Update.error);	
	},
	
	currentBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
			fn(file);
		}, Update.error);
	},
	
	gotFileEntry: function(fileEntry, fn) {
		var fileTransfer = new FileTransfer();
		fileEntry.remove();
		fileTransfer.download(Update.server + 'api/build', fileEntry.toURL(), function(file) {
			Update.downloadComplete(file, fn);
		}, Update.error);
	},
	
	downloadComplete:function(file, fn) {
		console.log("download complete: " + file.toURL());
		fn(file);
	},
	
	error: function() {
		console.log('ERROR',arguments);
	},

	update: function() {
		console.debug('UPDATEING');

		for (var x in Update.build.remote.files) {
			Update.getFile(Update.build.remote.files[x]);
		}
	},
	
	getFile: function(file) {
		console.log('downloading ', file);
	}
};
