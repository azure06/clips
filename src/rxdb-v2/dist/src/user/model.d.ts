import findLocalDevices from 'local-devices';
import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';
export interface UserDatabaseCollection {
    user: UserCollection;
}
export interface UserDoc {
    id: string;
    username: string;
    color: string;
    device: findLocalDevices.IDevice & {
        port: number;
    };
    permission: 'always' | 'once';
    updatedAt: number;
    createdAt: number;
}
export declare type UserDocMethods = {};
export declare type UserCollectionMethods = {
    upsertUser(this: UserCollection, user: Omit<UserDoc, 'id' | 'updatedAt' | 'createdAt'> & {
        id?: string;
        updatedAt?: number;
        createdAt?: number;
    }): Promise<UserDoc>;
    findUser(this: UserCollection, deviceId: string): Promise<UserDoc | undefined>;
    findUsers(this: UserCollection): Promise<UserDoc[]>;
    removeUsers(this: UserCollection, userIds: string[]): Promise<UserDoc[]>;
};
export declare type UserCollection = RxCollection<UserDoc, UserDocMethods, UserCollectionMethods>;
export declare type UserDocument = RxDocument<UserDoc, UserDocMethods>;
export declare const schema: RxJsonSchema<UserDoc>;
//# sourceMappingURL=model.d.ts.map