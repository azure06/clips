import { ClipDoc, ClipRegExp } from './model';
import { RxQuery } from 'rxdb';

type FieldName =
  | 'id'
  | 'plainText'
  | 'htmlText'
  | 'richText'
  | 'dataURI'
  | 'category'
  | 'type'
  | 'formats'
  | 'updatedAt'
  | 'createdAt';

const escape = (text: string) =>
  text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const likeSearch = (fieldName: FieldName, word: string) =>
  ({
    [fieldName]: { $regex: new RegExp(`.*${escape(word)}.*`, 'is') },
  } as ClipRegExp);

const advancedSearch = (fieldName: FieldName, words: string[]) => {
  const regex = words.reduce(
    (acc, word) => (acc += `(?=.*?(${escape(word)}))`),
    ''
  );
  return { [fieldName]: { $regex: new RegExp(regex, 'is') } } as ClipRegExp;
};

const applyFilter = (
  query: RxQuery,
  [head, ...tail]: Array<[string | undefined, string | number | undefined]>
): RxQuery => {
  const [key, value] = head || [];
  const nextQuery =
    key && value !== undefined ? query.where(key).eq(value) : query;
  return tail.length > 0 ? applyFilter(nextQuery, tail) : nextQuery;
};

export const patterns = { likeSearch, advancedSearch };
export const query = { applyFilter };
