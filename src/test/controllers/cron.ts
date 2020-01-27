import { BaseController } from "lynx-framework/base.controller";
import { Route, API, GET } from "lynx-framework/decorators";
import { logger } from "lynx-framework/logger";

import CronModule from "../../index";

@Route("/cron")
export default class CronJobController extends BaseController {
    @API()
    @GET("/")
    async cron() {
        logger.debug("Eccomi");
        return true;
    }

    @API()
    @GET("/register")
    async registerCron() {
        CronModule.get().addJob("* * * * * *", "http://localhost:3000/cron");
        return true;
    }

    @API()
    @GET("/delete")
    async deleteCron() {
        CronModule.get().removeJob("* * * * * *", "http://localhost:3000/cron");
        return true;
    }
}
