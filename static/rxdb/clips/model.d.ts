import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';
export interface ClipsDatabaseCollection {
    clips: ClipsCollection;
}
export declare type Format = 'text/plain' | 'text/html' | 'text/rtf' | 'image/png' | 'image/jpg' | 'vscode-editor-data';
export interface ClipDoc {
    id: string;
    plainText: string;
    htmlText: string;
    richText: string;
    dataURI: string;
    category: string;
    type: 'text' | 'image';
    formats: Format[];
    updatedAt: number;
    createdAt: number;
}
export interface ClipSearchConditions {
    regex: ClipRegExp;
    limit: number;
    skip: number;
    lte: number;
    gte: number;
    filters: Partial<SearchFilters>;
    sort: 'plainText' | 'type' | 'category' | 'updatedAt' | 'createdAt' | '-plainText' | '-type' | '-category' | '-updatedAt' | '-createdAt';
}
export interface SearchFilters {
    readonly id: string;
    readonly plainText: string;
    readonly htmlText: string;
    readonly richText: string;
    readonly dataURI: string;
    readonly category: 'starred' | string;
    readonly type: 'text' | 'image';
    readonly formats: string[];
    readonly updatedAt: number;
    readonly createdAt: number;
}
export declare type ClipRegExp = {
    readonly id: {
        $regex: RegExp;
    };
} | {
    readonly plainText: {
        $regex: RegExp;
    };
} | {
    readonly htmlText: {
        $regex: RegExp;
    };
} | {
    readonly richText: {
        $regex: RegExp;
    };
} | {
    readonly dataURI: {
        $regex: RegExp;
    };
} | {
    readonly category: {
        $regex: RegExp;
    };
} | {
    readonly type: {
        $regex: RegExp;
    };
} | {
    readonly formats: {
        $regex: RegExp;
    };
} | {
    readonly updatedAt: {
        $regex: RegExp;
    };
} | {
    readonly createdAt: {
        $regex: RegExp;
    };
};
export declare type ClipsDocMethods = {};
export declare type ClipsCollectionMethods = {
    dumpCollection(this: ClipsCollection): Promise<ClipDoc[]>;
    countAllDocuments(this: ClipsCollection): Promise<number>;
    findClips(this: ClipsCollection, { limit, skip, regex, filters, sort }: Partial<ClipSearchConditions>): Promise<ClipDoc[]>;
    findClipsLte(this: ClipsCollection, lte: number): Promise<ClipDoc[]>;
    insertClip(this: ClipsCollection, clip: Omit<ClipDoc, 'id'> & {
        id?: string;
    }): Promise<ClipDoc>;
    modifyClip(this: ClipsCollection, clip: ClipDoc): Promise<ClipDoc>;
    removeClips(this: ClipsCollection, clipsIds: string[]): Promise<ClipDoc[]>;
    removeAllClips(this: ClipsCollection): Promise<ClipDoc[]>;
    restore(this: ClipsCollection): Promise<unknown>;
};
export declare type ClipsCollection = RxCollection<ClipDoc, ClipsDocMethods, ClipsCollectionMethods>;
export declare type ClipDocument = RxDocument<ClipDoc, ClipsDocMethods>;
export declare const schema: RxJsonSchema<ClipDoc>;
//# sourceMappingURL=model.d.ts.map