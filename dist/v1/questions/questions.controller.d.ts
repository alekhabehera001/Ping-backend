import { QuestionsService } from './questions.service';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    getToday(req: any): Promise<{
        message: string;
        data: any;
    }>;
    create(body: any): Promise<{
        message: string;
        data: any;
    }>;
    list(query: any): Promise<{
        message: string;
        data: {
            items: any[];
            total: number;
            page: any;
            limit: any;
        };
    }>;
}
