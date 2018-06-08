import SimpleModule from "lynx-framework/simple.module";
import { logger } from "lynx-framework/logger";

import { CronJob } from "cron";
import axios from "axios";

export default class CronModule extends SimpleModule {
    static settings = {};
    private static self: CronModule;

    public static get(): CronModule {
        return this.self;
    }

    private jobs: CronJob[] = [];

    constructor() {
        super();
        CronModule.self = this;
    }

    /**
     * Add a new cron job.
     * The CronModule will execute the endpoint as a GET request in accordance
     * with the when parameter.
     * @param when the standard cron date definition, supporting *
     * @param endpoint the GET endpoint that will be executed.
     * @param retry number of the retry if the job faild (default: 5 times).
     */
    public addJob(when: string, endpoint: string, retry: number = 5) {
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
        this.jobs.push(job);
    }
}
