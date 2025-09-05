export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export declare const EmailTemplates: {
    welcome: (name: string) => EmailTemplate;
    bookingConfirmation: (bookingDetails: any) => EmailTemplate;
    passwordReset: (name: string, resetToken: string) => EmailTemplate;
    paymentConfirmation: (paymentDetails: any) => EmailTemplate;
    waiverConfirmation: (waiverDetails: any) => EmailTemplate;
};
//# sourceMappingURL=emailTemplates.d.ts.map