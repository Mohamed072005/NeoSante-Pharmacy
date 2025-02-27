export interface EmailServiceInterface {
  sendAccountVerificationEmail(email: string, name: string, token: string): Promise<void>
  sendOTPCodeVerificationEmail(email: string, name: string, code: number): Promise<void>
  sendResetPasswordEmail(email: string, name: string, token: string): Promise<void>
}