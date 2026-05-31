import { AnswersService } from './answers.service';
export declare class AnswersController {
    private readonly answersService;
    constructor(answersService: AnswersService);
    submit(req: any, body: any): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../../schemas/answer.schema").AnswerDocument, {}, {}> & import("../../schemas/answer.schema").Answer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getToday(req: any, questionId: string): Promise<{
        message: string;
        data: {
            myAnswer: (import("mongoose").FlattenMaps<import("../../schemas/answer.schema").AnswerDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            }) | null;
            partnerAnswer: (import("mongoose").FlattenMaps<import("../../schemas/answer.schema").AnswerDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            }) | null | undefined;
            bothAnswered: boolean;
        };
    }>;
    getHistory(req: any, query: any): Promise<{
        message: string;
        data: {
            items: (import("mongoose").FlattenMaps<import("../../schemas/answer.schema").AnswerDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            total: number;
            page: any;
            limit: any;
        };
    }>;
}
