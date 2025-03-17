import { EmailServiceInterface } from "./interfaces/email.service.interface";
import * as nodemailer from 'nodemailer'
import { Inject, Injectable } from "@nestjs/common";
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmailService implements EmailServiceInterface {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async sendAccountVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        './templates/verification-email.handlebars',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const verificationURL = `${process.env.BACK_END_URL}:${process.env.PORT}/auth/verify-account?token=${token}`;
      const html = template({
        name,
        verificationUrl: verificationURL,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendOTPCodeVerificationEmail(
    email: string,
    name: string,
    code: number,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        './templates/otp-email.handlebars',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const html = template({
        name,
        otpCode: code,
        expiryMinutes: '5',
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Device',
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendResetPasswordEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        './templates/reset-password-email.handlebars',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const verificationURL = `${process.env.FRONT_END_URL}:${process.env.FRONT_APP_PORT}/auth/reset-password/${token}`;
      const html = template({
        name,
        resetUrl: verificationURL,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password Email',
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      console.error('Failed to send reset password email:', error);
      throw new Error('Failed to send reset password email');
    }
  }

  async sendNewPharmacyHiringToAdmin(
    pharmacyName: string,
    pharmacyOwner: string,
    pharmacyLocation: string,
    contactEmail: string,
    contactPhone: string,
    adminEmail: string,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        './templates/create-pharmacy-hiring.handlebars',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const adminDashboardUrl = `${process.env.FRONT_END_URL}:${process.env.FRONT_APP_PORT}/dashboard/admin/pharmacies`;
      const html = template({
        pharmacyName,
        pharmacyOwner,
        pharmacyLocation,
        contactEmail,
        contactPhone,
        adminDashboardUrl: adminDashboardUrl,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: "New Pharmacy Waiting You're improvement",
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      console.error('Failed to send New Pharmacy hiring email:', error);
      throw new Error('Failed to send New Pharmacy hiring email');
    }
  }

  async sendPharmacyApprovalEmail(email: string, name: string): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        './templates/pharmacy-approval.handlebars',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const verificationURL = `${process.env.FRONT_END_URL}:${process.env.FRONT_APP_PORT}/auth`;
      const html = template({
        UserName: name,
        loginUrl: verificationURL,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Pharmacy Approval',
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      console.error('Failed to send pharmacy approval email:', error);
      throw new Error('Failed to send pharmacy approval email');
    }
  }
}