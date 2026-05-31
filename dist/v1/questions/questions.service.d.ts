import { Model } from 'mongoose';
import { QuestionDocument } from '../../schemas/question.schema';
export declare class QuestionsService {
    private readonly questionModel;
    constructor(questionModel: Model<QuestionDocument>);
    getTodayQuestion(): Promise<any>;
    getOrCreateTodayQuestion(): Promise<any>;
    create(data: {
        text: string;
        category: string;
        scheduledFor: Date;
    }): Promise<any>;
    list(page: number, limit: number, category?: string): Promise<{
        items: any[];
        total: number;
    }>;
    seedDefaultQuestions(): Promise<void>;
}
