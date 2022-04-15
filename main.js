const { app , BrowserWindow } = require('electron')
const path = require('path')


const createWindow=()=>{
    const mainWindow = new BrowserWindow({
        width:900,
        height:600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('./src/templates/app.html')

}

app.whenReady().then(()=>{
    createWindow()
})


app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin') app.quit()
})

