const {contextBridge , ipcRenderer} = require('electron')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

process.once('loaded' , ()=>{
        window.addEventListener('message', e=>{
                if(e.data.type === 'select-dirs'){
                        ipcRenderer.send('select-dirs')
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

        const dir_name = path.join(output_path , 'favvy/')
        console.log(dir_name)

        fs.mkdir(dir_name , (err)=>{
                if(err){
                        console.error(err)
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

        // lopping through favicons and creating them based on data in array
        favicons.forEach(favicon => sharpImgInst.resize({width:favicon.width , height:favicon.height}).png().toFile(dir_name+favicon.name))
})
