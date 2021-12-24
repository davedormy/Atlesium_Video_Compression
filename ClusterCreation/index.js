const cluster=require('cluster');
const os=require('os');
const async=require('express-async-handler');
const {createWorkerPool}=require('../WorkerPool/PoolCreation.js');
const childProcessesWorkerThreads={};

const createCluster=(app)=>{
    cluster.schedulingPolicy = cluster.SCHED_RR;     
    const cpuCount=os.cpus().length;


    if(cluster.isMaster){
        masterProcess(cpuCount);
    }else{
        childProcess(app);
    }
}


const masterProcess=(cpuCount)=>{
    console.log("Creating master process");
    for(let i=0;i<cpuCount;i++){
        cluster.fork();
    }

    cluster.on('exit',(worker,code,signal)=>{
        console.log("Worker id:"+worker.process.pid+" has died");
        cluster.fork();
    })
}

const childProcess=(app)=>{
    console.log("Creating child process");
    console.log("Child process id:"+process.pid);

    if(childProcessesWorkerThreads[process.pid]==null){
        const workerPool=createWorkerPool();
        childProcessesWorkerThreads[process.pid]=workerPool;
    }
    app.post('/videoCompression',async(req,res)=>{
        try{
            const{
                workerPool,
                waiting
            }=childProcessesWorkerThreads[process.pid];
            console.log(childProcessesWorkerThreads[process.pid]);
            if(workerPool.length>0){
                console.log("Compressing video");
                const selectedWorker=workerPool.shift();
                handleRequest(
                    selectedWorker,
                    res,
                    req,
                    childProcessesWorkerThreads[process.pid]);
            }else{
                waiting.push((worker) => handleRequest(
                    worker,
                    res,
                    req,
                    childProcessesWorkerThreads[process.pid]))
            }

        }catch(err){
            console.log(err);
            res.json({
                confirmation:"Failure",
                data:{
                    statusCode:400,
                    message:"Error occured when compressed video"
                }
            })
        }
    })

    function handleRequest(worker,res,req,childProcessWorkerThread){
        try{
            const {
                waiting,
                workerPool
            }=childProcessWorkerThread;
            
            worker.postMessage(req.body);
            worker.on('message',compressionData=>{
                try{
                    res.json({
                        confirmation:"Success",
                        data:{
                            statusCode:201,
                            message:compressionData
                        }
                    })
                    if (waiting.length > 0)
                        waiting.shift()(worker);
                    else
                        workerPool.push(worker);
                }catch(err){
                    console.log("Error in worker encountered");
                }
            });
        }catch(err){
            console.log("Error encountered");
        }
    }
    const server=app.listen(process.env.port || 8081,()=>{
        console.log("Node video compression server running...");
    });
}

module.exports={
    createCluster
}