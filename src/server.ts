import fastify, { FastifyInstance } from "fastify";
import { appendFileSync } from "fs";
import fastifyMultipart from "fastify-multipart";
import { MailService } from "@sendgrid/mail";
import { email } from "datamask";

const sendgridClient = new MailService();

sendgridClient.setApiKey(process.env.SENDGRID_API_KEY || "");

const server: FastifyInstance = fastify({});

server
  .register(fastifyMultipart, { addToBody: true })
  .all("/hello", async (_, reply) => {
    reply.send({ hello: "world" });
  })
  .all("/mail", async (request, reply) => {
    const sgBody = request.body as EmailBody;
    const regExFloat = /([0-9]*[.])?[0-9]+/g;
   
    const guess = sgBody.text.match(regExFloat)[0];
    const sender = JSON.parse(sgBody.envelope).from;
   
    appendFileSync("entries.txt", `${sender}# #${guess}\n`);
   
    const msg = {
      to: {
        email: sender,
      },
      from: {
        email: "lottery@zero-g.me",
        name: "SendGrid Demo",
      },
      subject: `RE: ${sgBody.subject}`,
      html: `<h1>Thanks for your Submission!</h1>
      <p>We registered your guess "${guess}" based on the message you sent:</p>
      <p style="margin-left:10%; margin-right:10%;font-style: italic;">${sgBody.text}</p>
   
      <p>Feel free to send another email if you want to update your guess.</p>
   
      <p>The submitted data will be only be used for the demo and deleted afterward.</p>`,
    };
   
    try {
      await sendgridClient.send(msg);
      console.log(`Response has been sent to ${email(sender)}.`);
      reply.code(201);
    } catch (error) {
      console.error(error);
      reply.code(500);
    }
   
    reply.send();
   });

server.listen(3000, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Restarted at: ${address}`);
});
