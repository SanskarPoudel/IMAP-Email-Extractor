import Imap from "imap";
import { simpleParser } from "mailparser";

export async function getUnseenMessagesWithAttachments(
  userEmail: string,
  identifier: string
) {
  try {
    // IMAP configuration
    const imapConfig = {
      user: process.env.IMAP_USER, // Replace with your IMAP user
      password: process.env.IMAP_PASSWORD, // Replace with your IMAP password
      host: "smtp.gmail.com",
      port: 993,
      tls: true,
      secure: true,
      connTimeout: 90000,
      tlsOptions: { rejectUnauthorized: false },
    };

    const imap = new Imap(imapConfig);

    await new Promise((resolve, reject) => {
      imap.once("ready", resolve);
      imap.once("error", reject);
      imap.connect();
    });

    await new Promise((resolve, reject) => {
      imap.openBox("INBOX", false, (err: any, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });

    const searchCriteria = [
      ["UNSEEN"],
      ["FROM", userEmail],
      ["SUBJECT", identifier],
    ];

    const fetchOptions = {
      bodies: "",
      struct: true,
    };

    const fetchResults: any[] = await new Promise(async (resolve, reject) => {
      imap.search(searchCriteria, (err, uids) => {
        if (err) {
          reject(err);
          return;
        }

        const messages: any[] = [];

        if (uids.length === 0) {
          resolve(messages);
          return;
        }

        const fetch = imap.fetch(uids, fetchOptions);
        const parsingPromises: Promise<void>[] = [];

        fetch.on("message", (msg, seqno) => {
          const message: any = { seqno, content: "", attachments: [] };

          const parsingPromise = new Promise<void>((pResolve, pReject) => {
            msg.on("body", async (stream, info) => {
              try {
                const parsed = await simpleParser(stream as any);
                message.content = parsed.text;
                message.html = parsed.html;
                message.attachments = parsed.attachments;
                pResolve();
              } catch (err) {
                console.log(err, "simpleParser");
                pReject(err);
              }
            });
          });

          parsingPromises.push(parsingPromise);

          msg.once("attributes", (attrs) => {
            const flags = attrs.flags || [];
            const isUnseen = flags.includes("\\Seen");
            if (!isUnseen) {
              message.messageId = attrs.uid;
              message.references = attrs.references || attrs["in-reply-to"];
            }
          });

          msg.once("end", () => {
            messages.push(message);
          });
        });

        fetch.once("error", reject);

        fetch.once("end", async () => {
          try {
            await Promise.all(parsingPromises);
            resolve(messages);
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    if (fetchResults.length > 0) {
      await new Promise<void>((resolve, reject) => {
        imap.setFlags(
          fetchResults.map((msg: any) => msg.messageId),
          ["\\Seen"],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          }
        );
      });
    }

    await new Promise((resolve, reject) => {
      imap.once("close", resolve);
      imap.end();
    });

    return fetchResults;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve unseen messages.");
  }
}
