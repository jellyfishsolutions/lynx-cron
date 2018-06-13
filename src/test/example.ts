import { App, ConfigBuilder } from "lynx-framework";
import CronModule from "../index";

const port = Number(process.env.PORT) || 3000;

let builder = new ConfigBuilder(__dirname);

let myConfig = builder.build();

export const app = new App(myConfig, [new CronModule()]);

app.startServer(port);
