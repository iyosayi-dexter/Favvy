const { app , BrowserWindow , ipcMain } = require('electron');
const { dialog } = require('electron/main');
const path = require('path')


let mainWindow;

const createWindow=()=>{
    mainWindow = new BrowserWindow({
        width:900,
        height:600,
        icon: path.join(__dirname , '/src/assets/logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('./src/templates/app.html')

}

app.disableHardwareAcceleration()

app.whenReady().then(()=>{
    createWindow()
})


app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin') app.quit()
})



ipcMain.on('select-dir', async (evt)=>{
    let filePaths = []
    await dialog.showOpenDialog(mainWindow , {properties:['openDirectory']}).then(result =>{
        filePaths = result.filePaths
    })
    evt.returnValue = filePaths
})