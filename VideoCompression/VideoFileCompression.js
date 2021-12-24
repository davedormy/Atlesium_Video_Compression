const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const uuid = require('uuid')
const fs=require('fs');

const decodeBase64Url=(url)=>{
    try{
        var decodedVideo = new Buffer.from(url,'base64');
        return decodedVideo;
    }catch(err){
        console.log(err);
    }
}

const compressVideo=(id,videoUrl,isPhoneEnabled)=>{
    try{
        return new Promise((resolve,reject)=>{
            const compressedVideoId='compressedVideo-'+id;
            const uniqueCompressVideoUrl=`./${compressedVideoId}.mp4`;
            const video=videoUrl;
            const compressionFactors=isPhoneEnabled==true?'700x880':'1280x480';
            ffmpeg(video)
                .size(compressionFactors)
                .output(uniqueCompressVideoUrl)
                .on('end',function(err){
                    resolve(uniqueCompressVideoUrl);
                })
                .on('error',function(err){
                    console.log(err);
                    reject(err);
                }).run();
        })
    }catch(err){
        throw err;
    }
}


const createVideoFile=(id,decodedVideo)=>{
    try{
        return new Promise((resolve,reject)=>{
            const uniqueVideoTag='video-'+id;
            const uniqueDummyVideoUrl=`./${uniqueVideoTag}.mp4`;
            fs.writeFile(uniqueDummyVideoUrl,decodedVideo, ()=>{
                resolve(uniqueDummyVideoUrl);
            })
        })
    }catch(err){
        throw err;
    }
}

const deleteDummyFiles=(url)=>{
    try{
        return new Promise((resolve,reject)=>{
            fs.unlink(url,(err)=>{
                if(err)
                    throw err;
                resolve('Success');
            })
        })
    }catch(err){
        throw err;
    }
}

const readFileAndReturnBuffer=(videoUrl)=>{
    try{
        return new Promise((resolve,reject)=>{
            fs.readFile(videoUrl,'base64',(err,data)=>{
                if(err){
                    throw err;
                }
                resolve(decodeBase64Url(data));
            })
        })
    }catch(err){
        throw err;
    }
}
const videoCompression=async({videoUrl,isPhoneEnabled})=>{
    try{
        //create a uuid for each video url
        console.log("Creating video file compression");
        if(videoUrl!="" && videoUrl!=null){
            const uniqueVerificationId=uuid.v4();
            console.log("Starting compression for video url:");
            videoUrl=videoUrl.replace('data:video/quicktime;base64,',"");
            videoUrl=videoUrl.replace('data:video/mp4;base64,',"");
            
            const decodedVideo=decodeBase64Url(videoUrl);
            const dummyVideoElementUrl=await createVideoFile(uniqueVerificationId,decodedVideo);
            const compressVideoResult=await compressVideo(uniqueVerificationId,dummyVideoElementUrl,isPhoneEnabled);
            const decodedCompressedVideo=await readFileAndReturnBuffer(compressVideoResult);


            const promise=[];
            promise.push(deleteDummyFiles(dummyVideoElementUrl));
            promise.push(deleteDummyFiles(compressVideoResult));
    
            return Promise.all(promise).then(result=>{
                console.log("Compression completed");

                const videoCompressionEndResult={
                    compressedVideo:decodedCompressedVideo,
                    token:uniqueVerificationId
                }
                return videoCompressionEndResult
            })
        }
    }catch(err){
        throw err;
    }
}

module.exports={
    videoCompression
}