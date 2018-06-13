import SimpleModule from "lynx-framework/simple.module";
import Config from "lynx-framework/config";
import { logger } from "lynx-framework/logger";

import CronJobEntity from "./entities/cronjob.entity";

import { CronJob } from "cron";
import axios from "axios";

const DEFAULT_RETRIES = 5;

export default class CronModule extends SimpleModule {
    static settings = {};
    private static self: CronModule;

    public static get(): CronModule {
        return this.self;
    }

    private jobs: {
        when: string;
        endpoint: string;
        retry: number;
        job: CronJob;
    }[] = [];

    constructor() {
        super();
        CronModule.self = this;
        setTimeout(() => this.rebuildJobs(), 5000);
    }

    public mount(config: Config) {
        super.mount(config);
        config.db.entities.unshift(__dirname + "/entities/*.entity.js");
    }

    /**
     * Add a new cron job.
     * The CronModule will execute the endpoint as a GET request in accordance
     * with the when parameter.
     * @param when the standard cron date definition, supporting *
     * @param endpoint the GET endpoint that will be executed.
     * @param retry number of the retry if the job faild (default: 5 times).
     */
    public addJob(
        when: string,
        endpoint: string,
        retry: number = DEFAULT_RETRIES,
        persist: boolean = true
    ) {
        let job = new CronJob(
            when,
            async () => {
                let i = 0;
                while (i < retry) {
                    try {
                        let result = await axios.get(endpoint);
                        if (result.status >= 200 || result.status < 300) {
                            break;
                        }
                        logger.info(
                            "The Cron Job with endpoint " +
                                endpoint +
                                " returned " +
                                result.status
                        );
                    } catch (e) {
                        logger.error(e);
                    }
                    i++;
                }
            },
            () => {},
            true
        );
        this.jobs.push({
            when: when,
            endpoint: endpoint,
            retry: retry,
            job: job
        });
        if (persist) {
            let cj = new CronJobEntity();
            cj.when = when;
            cj.endpoint = endpoint;
            cj.retry = retry;
            cj.save().catch(err => {
                logger.error("Error saving the CronJob", err);
            });
        }
    }

    public removeJob(
        when: string,
        endpoint: string,
        retry: number = DEFAULT_RETRIES
    ) {
        let index = 0;
        for (let j of this.jobs) {
            if (j.when == when && j.endpoint == endpoint && j.retry == retry) {
                j.job.stop();
                this.jobs.splice(index, 1);
                CronJobEntity.removeJob(when, endpoint, retry);
            }
            index++;
        }
    }

    private async rebuildJobs() {
        try {
            let jobs = await CronJobEntity.find();
            if (!jobs) {
                return;
            }
            logger.info("Recreating the CronJobs...");
            for (let j of jobs) {
                this.addJob(j.when, j.endpoint, j.retry, false);
            }
            logger.info("DONE!");
        } catch (e) {
            logger.error("Error recreating the CronJobs!", e);
        }
    }
}
