## pino-discord

#### Install

```
$ npm i -g pino-discord
```

#### Get Start

```
$ echo '{"level":30,"time":1600408878699,"pid":61564,"hostname":"MacBookPro.local","msg":"example info"}' | pino-discord [options] [discord-webhook]
```

```
$ node ./app.js | pino-discord [options] [discord-webhook]
```

```
# Get error only
$ node ./app.js | pino-discord -l 50 [discord-webhook]

# Get warn, error only
$ node ./app.js | pino-discord -l 40 [discord-webhook]
```

#### Usage

```
Usage: pino-discord [options] [discord-webhook]

Pipe your pino log to discord through discord webhook

Options:
  -V, --version              output the version number
  -l, --level <level>        set log level pipe to webhook (default: "30")
  -m, --mentions <mentions>  set mentions, id split with ','
  -u, --username <bot>       set bot name (default: "pino-discord")
  -h, --help                 display help for command
```

#### License

MIT
