import { RxQuery } from 'rxdb';
import { ClipRegExp } from './model';
declare type FieldName = 'id' | 'plainText' | 'htmlText' | 'richText' | 'dataURI' | 'category' | 'type' | 'formats' | 'updatedAt' | 'createdAt';
export declare const patterns: {
    likeSearch: (fieldName: FieldName, word: string) => ClipRegExp;
    advancedSearch: (fieldName: FieldName, words: string[]) => ClipRegExp;
};
export declare const query: {
    applyFilter: (query: RxQuery, [head, ...tail]: Array<[
        string | undefined,
        string | number | undefined
    ]>) => RxQuery;
};
export {};
//# sourceMappingURL=utils.d.ts.map