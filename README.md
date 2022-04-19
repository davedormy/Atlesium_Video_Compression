# Atlesium_Video_Compression


The video compression consists of using nodes ability to create child processes and worker threads.
The main idea behind this implementation is that since node js is not natively made for high CPU tasks 
you have to use another method to do these tasks which is why this is a microservice. Now if you were
to have about ten requests to compress a video, the service would be very slow and may possibly become
overloading with the number of requests. The solution that I found online is to use a combination of 
child processes and worker threads. The idea is on start there are x amount of child process created (based 
on the # of CPU's present) and then after that a x amount of worker threads are created and then
assigned to each of these child processes. Now when a request comes in it checks whether any workers are available 
then uses it. When the job is finished it the pushes the free worker thread into an array so that it 
can be used for the next request. In the middle of requests it also checks if there are any idles jobs.
