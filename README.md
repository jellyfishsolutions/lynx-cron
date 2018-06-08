# lynx-cron

Cron module for the Lynx framework.

This module adds a cron subsystem to your lynx application, wrapping the usual
cron libraries (more specifically `https://github.com/kelektiv/node-cron`).

Each cron job shall be a working GET endpoint, that will be executed at a certain
time, using the usual cron job specification.

A job is considered successfully completed if its status code is 200.
Usual http errors code, like 400 or 500, can be used to signal an error. In this
case, the job will be rescheduled, until the maximum number of retry is reached,
or if its status code is 200.

### Note

This CronModule implementation can be only used in an environment where the
lynx application is executed as a single instance. Otherwise, each job could be
executed more then once. In such environment, a more sophisticated cron module is
recommended.

## Installation

```
npm install --save lynx-cron
```

## Dependencies

Only the `lynx-framework`, of course :D

## Usage

In your main app file:

```
import CronModule from "lynx-cron";
...

let myConfig = new ConfigBuilder(__dirname).build();

const app = new App(myConfig, [new CronModule()]);
app.startServer(port);
```

The CronModule can be also be easily accessed as a singleton:

```
let cronModule = CronModule.get();
```

A job can be registered using the `addJob` method:

```
cronModule.addJob('00 30 11 * * 1-5', 'http://localhost:3000/jobs/invoices?authkey=123123123');
```
