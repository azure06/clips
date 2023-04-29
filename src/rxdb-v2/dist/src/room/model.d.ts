import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';
export interface RoomDatabaseCollection {
    room: RoomCollection;
}
export interface RoomDoc {
    id: string;
    roomName: string;
    userIds: string[];
    updatedAt: number;
    createdAt: number;
}
export declare type RoomDocMethods = {};
export declare type RoomCollectionMethods = {
    addRoom(this: RoomCollection, room: Omit<RoomDoc, 'id' | 'updatedAt' | 'createdAt'>): Promise<RoomDoc>;
    findRooms(this: RoomCollection): Promise<RoomDoc[]>;
    findRoomsByUserIds(this: RoomCollection, userIds: string[]): Promise<RoomDoc[]>;
    removeRooms(this: RoomCollection, roomIds: string[]): Promise<RoomDoc[]>;
};
export declare type RoomCollection = RxCollection<RoomDoc, RoomDocMethods, RoomCollectionMethods>;
export declare type RoomDocument = RxDocument<RoomDoc, RoomDocMethods>;
export declare const schema: RxJsonSchema<RoomDoc>;
//# sourceMappingURL=model.d.ts.map