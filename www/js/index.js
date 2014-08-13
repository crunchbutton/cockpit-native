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
			Update.gotFileEntry(fileEntry, 'api/build', fn);
		}, Update.error);	
	},
	
	currentBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
			fn(file);
		}, Update.error);
	},
	
	gotFileEntry: function(fileEntry, url, fn) {
		var fileTransfer = new FileTransfer();
		fileEntry.remove();
		fileTransfer.download(Update.server + url, fileEntry.toURL(), function(file) {
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
		
		var forward = function(file) {
			location.href = file.toURL();
		}

		var filesComplete = function() {
			Update.getFile('', 'cockpit.html', forward);
		};
		
		Update.getFiles(Update.build.remote.files, filesComplete);
	},
	
	getFiles: function(files, fn) {
		if (!files.length) {
			console.debug('NO MORE FILES TO DOWNLOAD');
			fn();
			return;
		}
		var file = files.shift();
		Update.getFile(file, Update.path + file, function() {
			Update.getFiles(files, fn);
		});
	},
	
	getFile: function(remote, local, fn) {
		console.log('downloading ', remote);
		
		/*
		Update.fs.root.getFile(local, {create: true, exclusive: false}, function(fileEntry) {
			Update.gotFileEntry(fileEntry, remote, fn);
		}, Update.error);
		*/
		
		Update.recursiveGetFile(local, {create: true, exclusive: false}, function(fileEntry) {
			Update.gotFileEntry(fileEntry, remote, fn);
		}, Update.error);
	},
	
	recursiveGetFile: function(local, opts, success, fail) {
		var path = local.split('/');
		var used = [];
		var name = '';

		function dir(s, f) {

			used.push(path.shift());
			name = used.join('/');
			console.debug(name);
			
			var suc = function(fileEntry) {
				if (!path.length) {
					success(fileEntry);
				} else {
					dir(s, f);
				}
			};

			if (path.length > 0) {
				console.debug('Creating directory', name);
				Update.fs.root.getDirectory(name, opts, suc, f);
			} else {
				console.debug('Creating file', name);
				Update.fs.root.getFile(name, opts, suc, f);
			}
		}

		dir(dir, fail);
	}
};
