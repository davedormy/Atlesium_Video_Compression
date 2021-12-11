const {parentPort}=require('worker_threads');
const {videoCompression}=require('../VideoCompression/VideoFileCompression.js');

parentPort.on('message',async(message)=>{
    console.log("Processing worker request");

    const compressedVideoInformation=await videoCompression(message);
    console.log(compressedVideoInformation);
    parentPort.postMessage(compressedVideoInformation);
});