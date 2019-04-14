const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron')
const util = require('util')
const path = require('path')
const fs = require('fs')
const stat = util.promisify(fs.stat)
// declare this as a variable globally so we can
// reference it and so it will not be garbage collected
let mainWindow
// wait for the main process to be ready
app.on('ready', () => {
	// path to our html
	const htmlPath = path.join('src', 'index.html')
	// create a browser window
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 600,
		frame: false,
		backgroundColor: '#FFF'
	});
	mainWindow.loadFile(htmlPath);
	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
})
// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});
// listen for files event by browser process
ipcMain.on('files', async (event, filesArr) => {
	try {
		// asynchronously get the data for all the files
		const data = await Promise.all(
			filesArr.map(async ({
				name,
				pathName
			}) => ({
				...await stat(pathName),
				name,
				pathName
			}))
		)
		mainWindow.webContents.send('metadata', data)
	} catch (error) {
		// send an error event if something goes wrong
		mainWindow.webContents.send('metadata:error', error)
	}
})
