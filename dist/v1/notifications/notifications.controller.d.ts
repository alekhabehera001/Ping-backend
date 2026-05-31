import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(req: any, query: any): Promise<{
        message: string;
        data: {
            items: (import("mongoose").FlattenMaps<import("../../schemas/notification.schema").NotificationDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            total: number;
            unread: number;
            page: any;
            limit: any;
        };
    }>;
    markRead(req: any, id: string): Promise<{
        message: string;
    }>;
    markAllRead(req: any): Promise<{
        message: string;
    }>;
}
