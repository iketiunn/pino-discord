const { version, name, description } = require("./package.json");
const program = require("commander");

const split = require("split2");
const pump = require("pump");
const through = require("through2");

const https = require("https");
const { URL } = require("url");
const post = (url, body) => {
  const data = JSON.stringify(body, null, 2);

  const req = https.request(
    new URL(url),
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Content-Length": data.length,
      },
    },
    (res) => {
      console.log("status:", res.statusCode);
      let d = "";
      res.on("data", (_d) => (d += _d));
      res.on("end", () => {
        console.log(d);
      });
    }
  );
  req.on("error", console.error);
  req.on("end", () => process.exit());
  req.write(data);
  req.end();
};

const makeBody = (opts, log) => {
  let content = `---
datetime: ${new Date(log.time).toISOString()},
time: ${log.time},
level ${log.level}
pid: ${log.pid},
hostname: ${log.hostname},
msg: ${log.msg}
---`;
  console.log(opts);
  if (opts.mentions) {
    content = content + "\n" + "@here";
  }
  return {
    username: opts.username || "pino-discord",
    content,
    allowed_mentions: {
      parse: [],
    },
  };
};

program
  .version(version)
  .name(name)
  .description(description)
  .requiredOption(
    "-u, --url <url>",
    "set webhook url"
    // "https://discord.com/api/webhooks/{webhook.id}/{webhook.token}"
  )
  .option("-l, --level <level>", "set log level pipe to webhook", "30")
  .option("-m, --mentions", "set mentions, split with ','")
  .option("-b, --bot <bot>", "set bot name", "pino-discord");
program.parse(process.argv);
/** Main */
const transport = through.obj(function (chunk, _enc, cb) {
  if (!program.url) throw new Error("webhook url not set!");
  // Skip if level below options.level
  if (program.level && Number(chunk.level) < Number(program.level)) return;

  // Send to hook
  post(
    program.url,
    makeBody(
      {
        mentions: program.mentions,
        botName: program.bot,
      },
      chunk
    )
  );
  cb();
});
pump(process.stdin, split(JSON.parse), transport);
