import { MailService } from "@sendgrid/mail";
import { readFileSync } from "fs";
import { email } from "datamask";

const SOLUTION = +(process.env.SOLUTION || "0"); // later add solution

const rawEntries = readFileSync("entries.txt").toString();
const dedupedEntries: { [key: string]: Entry } = {};

rawEntries.split("\n").forEach((line) => {
  const emailAddress = line.split("# #")[0],
    estimate = +line.split("# #")[1];
  if (emailAddress) {
    dedupedEntries[emailAddress] = {
      email: emailAddress,
      estimate: estimate,
      diff: Math.abs(SOLUTION - estimate),
    };
  }
});

const entries = Object.values(dedupedEntries);

const ranking = entries
  .sort((a, b) => a.diff - b.diff)
  .map((entry, idx) => `${idx + 1}.\t${email(entry.email)}\t${entry.estimate}`)
  .join("\n");

const sendgridClient = new MailService();
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY || "");

entries.forEach(async (entry) => {
  try {
    await sendgridClient.send({
      to: {
        email: entry.email,
      },
      from: {
        email: "lottery@zero-g.me",
        name: "SendGrid Demo",
      },
      templateId: "d-5b4125d183f5460cb8247c06d619c25d",
      dynamicTemplateData: {
        ranking,
        answer: SOLUTION,
      },
    });
    console.log(`Notified ${email(entry.email)}`);
  } catch (e) {
    console.error(e);
    debugger;
  }
});
