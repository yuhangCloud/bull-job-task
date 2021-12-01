const { baseQueue } = require('./base.queue');
const Chain = require('./chain');



const queueOption = {
    settings: {
        backoffStrategies: {
            jitter: function () {
                return 10 * 1000;
            }
        },
        // lockDuration: number = 30000; // Key expiration time for job locks.
        // lockRenewTime: number = 15000; // Interval on which to acquire the job lock
        // stalledInterval: number = 30000; // How often check for stalled jobs (use 0 for never checking).
        // maxStalledCount: number = 1; // Max amount of times a stalled job will be re-processed.
        // guardInterval: number = 5000; // Poll interval for delayed jobs and added jobs.
        // retryProcessDelay: number = 5000; // delay before processing next job in case of internal error.
        // backoffStrategies: {}; // A set of custom backoff strategies keyed by name.
        // drainDelay: number = 5; // A timeout for when the queue is in drained state (empty waiting for jobs).
    },
    redis: {
        port: 6379,
        host: 'localhost',
        password: 'TMSAS@8.6',
        db: 0,
        showFriendlyErrorStack: true,
        enableOfflineQueue: true
    },
}
const q_process = async (job, done) => {
    console.log(job);
    done();
}

const a_q = baseQueue(
    'a_test',
    q_process,
    {
        failedHandler: () => {

        },
        successHandler: () => {

        },
    },
    {
        queueOption,
        JobOption: null
    }
)

const b_q = baseQueue(
    'b_test',
    q_process,
    {
        failedHandler: () => {

        },
        successHandler: () => {

        },
    },
    {
        queueOption,
        JobOption: null
    }
)


const a_Task = new Chain(a_q.taskController());
const b_Task = new Chain(b_q.taskController(), a_Task);



(async () => {
    await a_Task.next(null, {
        uuid: "req.clpId_1"
    })
})()

