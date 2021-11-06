import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import {
  EmailApiSendEmailArgs,
  EmailApiSendEmailResponse,
  EmailApi,
  EmailApiSendSignupVerificationEmailArgs
} from './types';
import NodeMailerAppSmtpServer from './nodemailer-smtp-server';

export default class NodemailerEmailApi implements EmailApi {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport(new NodeMailerAppSmtpServer().getConfig());
  }

  async sendSignupVerificationEmail(
    args: EmailApiSendSignupVerificationEmailArgs
  ): Promise<EmailApiSendEmailResponse> {
    const { toEmail, emailVerificationToken } = args;

    const emailVerificationLink = this.buildSignupEmailVerificationLink(emailVerificationToken);

    const subject = 'Welcome to Duofinder! Please verify your email address';
    const textBody = this.buildSignupVerificationEmailTextBody(emailVerificationLink);
    const htmlBody = this.buildSignupVerificationEmailHtmlBody(emailVerificationLink);

    await this.sendEmail({
      toEmail,
      subject,
      textBody,
      htmlBody
    });

    return {
      toEmail,
      status: 'success'
    };
  }

  private async sendEmail(args: EmailApiSendEmailArgs): Promise<void> {
    const { toEmail, subject, htmlBody, textBody } = args;

    await this.transporter.sendMail({
      from: 'Duofinder <noreply@duofinder.com>',
      to: toEmail,
      subject,
      text: textBody,
      html: htmlBody
    });
  }

  private buildSignupVerificationEmailTextBody(emailVerificationLink: string): string {
    return `Welcome to Duofinder! Please click on the link below (or copy it to your browser) to verify your email address.${emailVerificationLink}`;
  }

  private buildSignupVerificationEmailHtmlBody(emailVerificationLink: string): string {
    return `<h1>Welcome to Duofinder</h1>
    <br/>
    Please click on the link below (or copy it to your browser) to verify your email address.
    <br/>
    <br/>
    <a href="${emailVerificationLink}">${emailVerificationLink}</a>`;
  }

  private buildSignupEmailVerificationLink(emailVerificationToken: string): string {
    //  TO-DO: this URL should change

    return `http://localhost:3000/api/auth/verify/${emailVerificationToken}`;
  }
}
