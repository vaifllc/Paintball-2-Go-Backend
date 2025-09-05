export declare class EmailService {
    static sendEmail(to: string, subject: string, html: string): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
    static sendBulkEmail(recipients: string[], subject: string, html: string): Promise<{
        success: boolean;
        totalSent: number;
        successful: number;
        failed: number;
        results: PromiseSettledResult<{
            success: boolean;
            data: import("resend").CreateEmailResponse;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            data?: undefined;
        }>[];
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        totalSent?: undefined;
        successful?: undefined;
        failed?: undefined;
        results?: undefined;
    }>;
    static sendCampaign(campaignId: string): Promise<{
        success: boolean;
        campaign: import("mongoose").Document<unknown, {}, import("../models/EmailCampaign").IEmailCampaign, {}, {}> & import("../models/EmailCampaign").IEmailCampaign & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        result: {
            success: boolean;
            totalSent: number;
            successful: number;
            failed: number;
            results: PromiseSettledResult<{
                success: boolean;
                data: import("resend").CreateEmailResponse;
                error?: undefined;
            } | {
                success: boolean;
                error: unknown;
                data?: undefined;
            }>[];
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            totalSent?: undefined;
            successful?: undefined;
            failed?: undefined;
            results?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        campaign?: undefined;
        result?: undefined;
    }>;
    static sendWelcomeEmail(userEmail: string, userName: string): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
    static sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
    static sendBookingConfirmation(bookingDetails: any): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
    static sendPaymentConfirmation(paymentDetails: any, userEmail: string): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
    static sendWaiverConfirmation(waiverDetails: any): Promise<{
        success: boolean;
        data: import("resend").CreateEmailResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        data?: undefined;
    }>;
}
//# sourceMappingURL=emailService.d.ts.map