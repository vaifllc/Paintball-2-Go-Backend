import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const checkMaintenanceMode: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.d.ts.map