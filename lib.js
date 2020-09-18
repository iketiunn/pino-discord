const { URL } = require("url");
const { version, name, description } = require("./package.json");
/**
 * Parse argv
 */
const program = require("commander")
  .version(version)
  .name(name)
  .description(description)
  .arguments("[discord-webhook]")
  .option("-l, --level <level>", "set log level pipe to webhook", "30")
  .option("-m, --mentions <mentions>", "set mentions, id split with ','")
  .option("-u, --username <bot>", "set bot name", "pino-discord")
  .parse(process.argv);
const url = new URL(program.args[0]); // Validation
exports.cli = { url, opts: program.opts() };

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
  if (opts.mentions) {
    const names = opts.mentions.split(",").map((n) => {
      const target = n.toLowerCase().trim();
      if (target === "here" || target === "everyone") {
        // Is Everyone
        return "@" + n.trim();
      } else {
        // Is user or role
        return "<@" + n.trim() + ">";
      }
    });
    content = content + "\n" + names.join(", ");
  }
  return {
    username: opts.username,
    content,
    allowed_mentions: {
      parse: ["users"],
      users: [],
    },
  };
};

const https = require("https");
/**
 * https post helper
 *
 * @param {URL} url
 * @param {object} body
 */
exports.post = (url, body) => {
  const data = JSON.stringify(body, null, 2);
  const req = https.request(
    url,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Content-Length": data.length,
      },
    },
    (res) => {
      let d = "";
      res.on("data", (_d) => (d += _d));
      if (res.statusCode >= 400) {
        console.error("status:", res.statusCode);
        res.on("end", () => {
          console.error(d);
        });
      }
    }
  );
  req.on("error", console.error);
  req.on("end", () => process.exit());
  req.write(data);
  req.end();
};
