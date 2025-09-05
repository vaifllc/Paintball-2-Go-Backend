export declare const generateRandomString: (length?: number) => string;
export declare const generateToken: () => string;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const calculateAge: (dateOfBirth: Date) => number;
export declare const isMinor: (dateOfBirth: Date) => boolean;
export declare const generateInvoiceNumber: (date?: Date) => string;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const formatPhoneNumber: (phone: string) => string;
export declare const sanitizeString: (str: string) => string;
export declare const generateSlug: (str: string) => string;
export declare const centsToDollars: (cents: number) => number;
export declare const dollarsToCents: (dollars: number) => number;
export declare const getDateRange: (period: string) => {
    startDate: Date;
    endDate: Date;
};
export declare const getPaginationParams: (page?: string, limit?: string) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const getPaginationMetadata: (total: number, page: number, limit: number) => {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
export declare const maskEmail: (email: string) => string;
export declare const maskPhone: (phone: string) => string;
export declare const isPastDate: (date: Date) => boolean;
export declare const isFutureDate: (date: Date) => boolean;
export declare const addBusinessDays: (date: Date, days: number) => Date;
export declare const getBusinessHours: (date: Date) => {
    isOpen: boolean;
    hours?: string;
};
export declare const isValidZipCode: (zipCode: string) => boolean;
export declare const calculateActivityPricing: (activityType: string, participants: number, addOns?: Array<{
    name: string;
    price: number;
    quantity: number;
}>) => number;
export declare const getActivityMinAge: (activityType: string) => number;
export declare const isValidActivityForAge: (activityType: string, participantAge: number) => boolean;
//# sourceMappingURL=helpers.d.ts.map