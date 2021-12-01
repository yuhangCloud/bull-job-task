'use strict'

const Bull = require('bull');


module.exports.baseQueue = (
    name,
    processor,
    {
        failedHandler,
        successHandler,
    },
    {
        queueOption,
        JobOption
    }
) => {
    let queue = new Bull(name, queueOption);

    queue.JobOption = JobOption || {
        attempts: 5,
        backoff: {
            type: 'jitter'
        },
    };
    // add job processor
    queue.process(function (job, done) {
        console.log(job);
        done();
    });
    console.log(queue.name, processor);


    // listen queue events
    queue.on('error', function (error) {
        console.log(error);
        console.error(`Error occurred in Queue [${queue.name}], err [${error}]`);
    });

    queue.on('completed', (job, result) => {
        job.failedReason = null;
        if (successHandler && typeof successHandler === 'function') {
            successHandler(job, result);
        }
    });

    queue.on('failed', (job, err) => {
        if (err.message === 'exit' || job.attemptsMade === job.opts.attempts) {
            if (failedHandler && typeof failedHandler === 'function') {
                failedHandler(job, err);
            }
            job.remove();
        }
    });

    queue.on('removed', (job) => {
        console.log(`Delete Job [${job.id}]`);
    });

    queue.taskController = (preCallback = null) => {
        return async (job_id, context) => {
            if (job_id) {
                return ['next', id, context];
            } else if (context && Object.keys(context).length > 0) { // create job
                let job_id = queue.name + ':' + context.uuid;
                if (preCallback && typeof preCallback === 'function') {
                    preCallback(context).then(() => {
                        queue.add(queue.name, context, {
                            jobId: job_id,
                            ...queue.JobOption
                        });
                        console.log(`Add Job [${job_id}]`);
                    });
                } else {
                    await queue.add(queue.name, context, {
                        jobId: job_id,
                        ...queue.JobOption
                    });
                    console.log(`Add Job [${job_id}]`);
                }
            }

            return [null, null, null];
        }
    };
    return queue;
}