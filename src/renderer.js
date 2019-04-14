'use strict'
const {
	ipcRenderer
} = require('electron')
// listen for the form to be submitted
const submitListener = document
	.querySelector('form')
	.addEventListener('submit', (event) => {
		// prevent default behavior that causes page refresh
		event.preventDefault()
		// an array of files with some metadata
		const files = [...document.getElementById('filePicker').files]
		// format the file data to only path and name
		const filesFormatted = files.map(({
			name,
			path: pathName
		}) => ({
			name,
			pathName
		}))
		// send the data to the main process
		ipcRenderer.send('files', filesFormatted)
	})
// metadata from the main process
ipcRenderer.on('metadata', (event, metadata) => {
	const pre = document.getElementById('data')
	//		pre.innerText = JSON.stringify(metadata, null, 2)
	pre.innerText = "";
	var obj = JSON.stringify(metadata, null, 2);
	var stringify = JSON.parse(obj);
	var options = {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: '2-digit',
		hour12: true
	};
	for (var i = 0; i < stringify.length; i++) {
		var div = document.createElement("div");
		div.classList.add("file");
		div.innerHTML = "<p>" + stringify[i]['name'] + "</p>" +
			"Type: " + stringify[i]['name'].substring(stringify[i]['name'].lastIndexOf(".") + 1) + "<br>" +
			"Size: " + formatBytes(stringify[i]['size']) + " (" + stringify[i]['size'] + " bytes)<br>" +
			"Location: " + stringify[i]['pathName'] + "<br>" +
			"Created: " + new Date(stringify[i]['ctime']).toLocaleString('en-US', options) + "<br>" +
			"Modified: " + new Date(stringify[i]['mtime']).toLocaleString('en-US', options) + "<br>" +
			"Accesed: " + new Date(stringify[i]['atime']).toLocaleString('en-US', options);
		pre.appendChild(div);
	}
})

function formatBytes(bytes, decimals) {
	if (bytes == 0) return '0 Bytes';
	var k = 1024,
		dm = decimals <= 0 ? 0 : decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
// error event from catch block in main process
ipcRenderer.on('metadata:error', (event, error) => {
	console.error(error)
})
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
(function handleWindowControls() {
	// When document has loaded, initialise
	document.onreadystatechange = () => {
		if (document.readyState == "complete") {
			init();
		}
	};

	function init() {
		let window = remote.getCurrentWindow();
		const minButton = document.getElementById('min-button'),
			maxButton = document.getElementById('max-button'),
			restoreButton = document.getElementById('restore-button'),
			closeButton = document.getElementById('close-button');
		minButton.addEventListener("click", event => {
			window = remote.getCurrentWindow();
			window.minimize();
		});
		maxButton.addEventListener("click", event => {
			window = remote.getCurrentWindow();
			window.maximize();
			toggleMaxRestoreButtons();
		});
		restoreButton.addEventListener("click", event => {
			window = remote.getCurrentWindow();
			window.unmaximize();
			toggleMaxRestoreButtons();
		});
		// Toggle maximise/restore buttons when maximisation/unmaximisation
		// occurs by means other than button clicks e.g. double-clicking
		// the title bar:
		toggleMaxRestoreButtons();
		window.on('maximize', toggleMaxRestoreButtons);
		window.on('unmaximize', toggleMaxRestoreButtons);
		closeButton.addEventListener("click", event => {
			window = remote.getCurrentWindow();
			window.close();
		});

		function toggleMaxRestoreButtons() {
			window = remote.getCurrentWindow();
			if (window.isMaximized()) {
				maxButton.style.display = "none";
				restoreButton.style.display = "flex";
			} else {
				restoreButton.style.display = "none";
				maxButton.style.display = "flex";
			}
		}
	}
})();
