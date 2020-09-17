const { version, name, description } = require("./package.json");
/**
 * Parse argv
 */
exports.opts = require("commander")
  .version(version)
  .name(name)
  .description(description)
  .requiredOption(
    "-u, --url <url>",
    "*required, set webhook url"
    // "https://discord.com/api/webhooks/{webhook.id}/{webhook.token}"
  )
  .option("-l, --level <level>", "set log level pipe to webhook", "30")
  .option("-m, --mentions", "set mentions, split with ','")
  .option("-u, --username <bot>", "set bot name", "pino-discord")
  .parse(process.argv)
  .opts();

/**
 * Format to discord payload with options
 */
exports.makeBody = (opts, log) => {
  let content = `---
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

const https = require("https");
const { URL } = require("url");
/**
 * https post helper
 *
 * @param {string} url
 * @param {object} body
 */
exports.post = (url, body) => {
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
