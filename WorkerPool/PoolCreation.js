const {Worker}=require('worker_threads');

const createWorkerPool=()=>{
    const workerPool = [
        new Worker('./WorkerPool/Worker.js'),
        new Worker('./WorkerPool/Worker.js'),
        new Worker('./WorkerPool/Worker.js'),
        new Worker('./WorkerPool/Worker.js'),
    ];

    const waiting = [];
    const workerPoolInformation={
        waiting,
        workerPool
    }
    return workerPoolInformation;
}
module.exports={
    createWorkerPool
};