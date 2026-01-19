import { IUser } from '../models/User';
import { IWorkspace } from '../models/Workspace';
import { UserRole } from '../models/Membership';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            workspace?: IWorkspace;
            userRole?: UserRole;
        }
    }
}
