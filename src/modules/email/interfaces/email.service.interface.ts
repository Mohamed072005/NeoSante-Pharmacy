export interface EmailServiceInterface {
  sendAccountVerificationEmail(email: string, name: string, token: string): Promise<void>
  sendOTPCodeVerificationEmail(email: string, name: string, code: number): Promise<void>
  sendResetPasswordEmail(email: string, name: string, token: string): Promise<void>
  sendNewPharmacyHiringToAdmin(pharmacyName: string, pharmacyOwner: string, pharmacyLocation: string, contactEmail: string, contactPhone: string, adminEmail: string): Promise<void>
  sendPharmacyApprovalEmail(email: string, name: string): Promise<void>
}