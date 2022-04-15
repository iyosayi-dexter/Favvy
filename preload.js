const {contextBridge, ipcRenderer} = require('electron')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')



window.addEventListener('DOMContentLoaded', ()=>{
        window.addEventListener('message', evt => {
                if (evt.data.type === 'select-dir') {
                        let ipc = ipcRenderer.sendSync('select-dir')
                        document.querySelector('#path_value').innerText = ipc[0]
                }
        })

})

contextBridge.exposeInMainWorld("imageMetaDataAPI" , async(path) =>{
        const metadata = await sharp(path).metadata()
        const {width , height} = metadata
        const resolution = { width , height }
        return resolution
})

contextBridge.exposeInMainWorld("favvyExportAPI", async (src , isGzip , output_path=null)=>{
        const sharpImgInst = sharp(src)

        const dir_name = `favvy-desktop-${new Date().toISOString().replace('T' , '-').replaceAll(':' ,'-').slice(0,-5)}/`
        const dir_path = path.join(output_path , dir_name)


        fs.mkdir(dir_path , (err)=>{
                if(err){
                        console.log(err)
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
