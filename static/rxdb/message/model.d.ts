import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';
export interface Progress {
    percentage: number;
    transferred: number;
    length: number;
    remaining: number;
    eta: number;
    runtime: number;
    speed: number;
}
export interface MessageDatabaseCollection {
    message: MessageCollection;
}
declare type PendingStatus = 'pending';
declare type ReadStatus = 'sent' | 'read';
declare type RejectedStatus = 'rejected';
export declare type MessageStatus = PendingStatus | ReadStatus | RejectedStatus;
export interface MessageDoc {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    type: 'text' | 'file';
    status: MessageStatus;
    ext?: string;
    updatedAt: number;
    createdAt: number;
}
export interface Content {
    progress: Progress;
    path: string;
}
export declare function defaultContent(): Content;
export declare function parseContent(content: string): Content;
export declare function stringifyContent(content: Content): string;
export declare type MessageDocMethods = {};
export declare type MessageCollectionMethods = {
    upsertMessage(this: MessageCollection, message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'>): Promise<MessageDoc>;
    findMessage(this: MessageCollection, roomId: string, messageId: string): Promise<MessageDoc | undefined>;
    findMessages(this: MessageCollection, roomId: string, options?: {
        limit: number;
        skip: number;
    }): Promise<MessageDoc[]>;
    findMessagesByStatus(this: MessageCollection, roomId: string, senderId: string, status: MessageStatus): Promise<MessageDoc[]>;
    removeMessages(this: MessageCollection, messageIds: string[]): Promise<MessageDoc[]>;
};
export declare type MessageCollection = RxCollection<MessageDoc, MessageDocMethods, MessageCollectionMethods>;
export declare type MessageDocument = RxDocument<MessageDoc, MessageDocMethods>;
export declare const schema: RxJsonSchema<MessageDoc>;
export {};
//# sourceMappingURL=model.d.ts.map