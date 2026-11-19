import Mailjet from "node-mailjet";

export class MailjetProvider {
    client;
    fromEmail;
    fromName;

    constructor(config) {
        this.client = new Mailjet({
            apiSecret: config.apiSecret, apiKey: config.apiKey,
        });
        this.fromEmail = config.fromEmail;
        this.fromName = config.fromName;
    }

    async sendMail(email, subject, html) {
        this.client.post('send', {version: 'v3.1'}).request({
            Messages: [{
                From: {
                    Email: this.fromEmail,// ahmedshoura279@gmail.com
                    Name: this.fromName// NGL-app-5
                }, To: [{
                    Email: email,
                },], Subject: subject, HTMLPart: html
            },],
        })
    }
}