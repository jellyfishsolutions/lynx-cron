import { BaseController } from "lynx-framework/base.controller";
import Request from "lynx-framework/request";
import { Route, API, GET } from "lynx-framework/decorators";
import { logger } from "lynx-framework/logger";

import CronModule from "../../index";

@Route("/cron")
export default class CronJobController extends BaseController {
    @API()
    @GET("/")
    async cron(req: Request) {
        logger.debug("Eccomi");
        return true;
    }

    @API()
    @GET("/register")
    async registerCron(req: Request) {
        CronModule.get().addJob("* * * * * *", "http://localhost:3000/cron");
        return true;
    }

    @API()
    @GET("/delete")
    async deleteCron(req: Request) {
        CronModule.get().removeJob("* * * * * *", "http://localhost:3000/cron");
        return true;
    }
}
