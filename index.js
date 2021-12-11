const express=require('express');

const cors=require('cors');
const bodyParser=require('body-parser');
const {createCluster}=require('./ClusterCreation/index.js');

const app=express();
app.use(cors());
app.use(bodyParser.urlencoded({limit: "400mb", extended: true, parameterLimit:50000000}));
app.use(bodyParser.json({limit: "400mb"}));

createCluster(app);




// const async=require('express-async-handler');
// const {Worker}=require('worker_threads');

// const cluster=require('cluster');
// const os=require('os');

// const workerPool = [  // Start a pool of four workers
//     new Worker('./WorkerPool/Worker.js'),
//     new Worker('./WorkerPool/Worker.js'),
//     new Worker('./WorkerPool/Worker.js'),
//     new Worker('./WorkerPool/Worker.js'),
//   ];

// const waiting = [];




// cluster.schedulingPolicy = cluster.SCHED_RR; 

// const cpuCount=os.cpus().length;



// if(cluster.isMaster){
//     masterProcess();
// }else{
//     childProcess();
// }

/*
    Maybe have a mapping to cluster situation when its matches to ids then
    it returns appropriate worker processes that then could be used (?)
*/


// function masterProcess(){
//     console.log("Creating master process");
//     for(let i=0;i<cpuCount;i++){
//         cluster.fork();
//     }

//     cluster.on('exit',(worker,code,signal)=>{
//         console.log("Worker id:"+worker.process.pid+" has died");
//         cluster.fork();
//     })
// }

// function childProcess(){
//     console.log("Creating child process");

//     app.post('/videoCompression',async(req,res)=>{
//         try{
//             if(workerPool.length>0){
//                 console.log("Compressing video");
//                 const selectedWorker=workerPool.shift();
//                 handleRequest(selectedWorker,res,req);
//             }else{
//                 waiting.push((worker) => handleRequest(worker,res,req))
//             }

//         }catch(err){
//             console.log(err);
//             res.json({
//                 confirmation:"Failure",
//                 data:{
//                     statusCode:400,
//                     message:"Error occured when compressed video"
//                 }
//             })
//         }
//     })

//     function handleRequest(worker,res,req){
//         const {videoUrl}=req.body;
//         worker.postMessage(videoUrl);
//         worker.on('message',compressionData=>{
//             res.json({
//                 confirmation:"Success",
//                 data:{
//                     statusCode:201,
//                     message:compressionData
//                 }
//             })
//             if (waiting.length > 0)
//             waiting.shift()(worker);
//           else
//             workerPool.push(worker);
//         });
//     }
//     const server=app.listen(process.env.port || 8081,()=>{
//         console.log("Node video compression server running...");
//     });
// }

