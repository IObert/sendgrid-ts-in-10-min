type EmailBody = {
    called: any;
    headers: any;
    attachments: any;
    dkim: any;
    subject: any;
    to: any;
    html: any;
    from: any;
    text: any;
    sender_ip: any;
    envelope: any;
    charsets: any;
    SPF: any;
};

type Entry = {
    email: string,
    estimate: number,
    diff: number
}