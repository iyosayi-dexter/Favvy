const {contextBridge, ipcRenderer} = require('electron')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')



window.addEventListener('DOMContentLoaded', ()=>{
        window.addEventListener('message', evt => {
                if (evt.data.type === 'select-dir') {
                        let ipc = ipcRenderer.sendSync('select-dir')

                        if(ipc.length > 0 ){
                                document.querySelector('#path_value').innerText = ipc[0]
                        }
                }
        })
})

contextBridge.exposeInMainWorld("imageMetaDataAPI" , async(path) =>{
        const metadata = await sharp(path).metadata()
        const {width , height} = metadata
        const resolution = { width , height }
        return resolution
})

contextBridge.exposeInMainWorld("favvyExportAPI", async (src , website_name , theme_color,  output_path)=>{
        const sharpImgInst = sharp(src)

        const dir_name = `favvy-desktop-${new Date().toISOString().replace('T' , '-').replaceAll(':' ,'-').slice(0,-5)}/`
        const dir_path = path.join(output_path , dir_name)

        fs.mkdir(dir_path , (err)=>{
                if(err){
                        return
                }
        })

        // creating the webmanifest file
        let webmanifestContent = `{
                "name": ${website_name},
                "short_name": ${website_name},
                "icons": [
                {
                        "src": "./android-chrome-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                },
                {
                        "src": "./android-chrome-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                }
                ],
                "theme_color": ${theme_color},
                "background_color": ${theme_color},
                "display": "standalone"
                }`

        fs.writeFile(dir_path+'site.webmanifest' , webmanifestContent , (err)=>{
                if(err){
                        return
                }
        })

        // creating the browserconfig file
        let browserconfigContent = `
                        <?xml version="1.0" encoding="utf-8"?>
                                <browserconfig>
                                        <msapplication>
                                                <tile>
                                                <square150x150logo src="/mstile-150x150.png"/>
                                                <TileColor>${theme_color}</TileColor>
                                                </tile>
                                        </msapplication>
                                </browserconfig>
                        `
        fs.writeFile(dir_path+'browserconfig.xml' , browserconfigContent , (err)=>{
                if(err){
                        return
                }
        })

        /*
                Creating the head.html file
                - contains details of how link favicons in index.html
        */
        let headHtmlContent = `<head>
                <!-- Created with favvy-desktop -->
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                <link rel="manifest" href="/site.webmanifest">
                <meta name="msapplication-config" content="/browserconfig.xml">
                <meta name="msapplication-TileColor" content="${theme_color}">
                <meta name="theme-color" content="${theme_color}">
        </head>`

        fs.writeFile(dir_path+"head.html" , headHtmlContent , (err)=>{
                if(err){
                        return
                }
        })

        // all favicons to be created
        const favicons = [
                {
                        width:16 ,
                        height:16,
                        name:'favicon-16x-16x.png'
                },
                {
                        width:32 ,
                        height:32,
                        name:'favicon-32x-32x.png'
                },
                {
                        width:48 ,
                        height:48,
                        name:'favicon.png'
                },
                {
                        width:150 ,
                        height:150,
                        name:'mstile-150x-150x.png'
                },
                {
                        width:192 ,
                        height:192,
                        name:'andriod-chrome-192x-192x.png'
                },
                {
                        width:512 ,
                        height:512,
                        name:'andriod-chrome-512x-512x.png'
                },
        ]

        favicons.forEach(favicon => sharpImgInst.resize({width:favicon.width , height:favicon.height}).png().toFile(dir_path+favicon.name))
})
