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

const isWorkerBusy=(worker,busyWorkers)=>{
    try{
        console.log(worker.threadId);
        let busyStatus=false;
        for(var i=0;i<busyWorkers.length;i++){
            if(busyWorkers[i].threadId==worker.threadId){
                busyStatus=true;
                break;
            }
        }
        return busyStatus;
    }catch(err){
        throw err;
    }
}

const removeWorkFromBusyQueue=async(busyQueue,worker)=>{
    try{
        for(var i=0;i<busyQueue.length;i++){
            if(busyQueue[i].threadId==worker.threadId){
                busyQueue.splice(i,1);
                break;
            }
        }
        return busyQueue;
    }catch(err){
        throw err;
    }
}


const initializeWorkerInWaiting=()=>{
    try{

    }catch(err){
        throw err;
    }
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
                waiting,
                busy
            }=childProcessesWorkerThreads[process.pid];
            console.log(process.pid);
            console.log(childProcessesWorkerThreads[process.pid]);
            if(workerPool.length>0){
                console.log("Compressing video");
                const selectedWorker=workerPool.shift();

                if(!isWorkerBusy(selectedWorker,busy)){
                    busy.push(selectedWorker);
                    childProcessesWorkerThreads[process.pid]={
                        ...childProcessesWorkerThreads[process.pid],
                        busy
                    }

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

                    childProcessesWorkerThreads[process.pid]={
                        ...childProcessesWorkerThreads[process.pid],
                        waiting
                    }
                }
            }else{
                waiting.push((worker) => handleRequest(
                    worker,
                    res,
                    req,
                    childProcessesWorkerThreads[process.pid]));

                
                childProcessesWorkerThreads[process.pid]={
                    ...childProcessesWorkerThreads[process.pid],
                    waiting
                }
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
            let {
                waiting,
                workerPool,
                busy
            }=childProcessWorkerThread;
            
            worker.postMessage(req.body);
            worker.on('message',compressionData=>{
                try{
                    if (waiting.length > 0){
                        //Wild
                        waiting.shift()(worker);
                        childProcessWorkerThread={
                            ...childProcessWorkerThread,
                            waiting
                        }
                    }else{
                        workerPool.push(worker);
                        busy=removeWorkFromBusyQueue(busy,worker);
                        childProcessWorkerThread={
                            ...childProcessWorkerThread,
                            busy,
                            workerPool
                        }
                    }

                    res.json({
                        confirmation:"Success",
                        data:{
                            statusCode:201,
                            message:compressionData
                        }
                    });
                }catch(err){
                    console.log("Error in worker encountered"+err);
                    res.json({
                        confirmation:"Failure",
                        data:{
                            statusCode:"Failure",
                            message:"Error occured when returning message response"
                        }
                    })
                }
                return;
            });
        }catch(err){
            console.log("Error encountered",err);
            res.json({
                confirmation:"Failure",
                data:{
                    statusCode:"Failure",
                    message:"Error occured when video compressing"
                }
            })
        }
    }
    const server=app.listen(process.env.port || 8081,()=>{
        console.log("Node video compression server running...");
    });
}

module.exports={
    createCluster
}