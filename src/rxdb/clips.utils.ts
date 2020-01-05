import { ClipDoc, ClipRegExp } from './clips.models';
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

const escape = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const likeSearch = (fieldName: FieldName, word: string) =>
  ({
    [fieldName]: { $regex: new RegExp(`.*${escape(word)}.*`, 'is') },
  } as ClipRegExp);

const advancedSearch = (fieldName: FieldName, words: string[]) => {
  const regex = words.reduce((acc, word) => (acc += `(?=.*?(${escape(word)}))`), '');
  return { [fieldName]: { $regex: new RegExp(regex, 'is') } } as ClipRegExp;
};

const applyFilter = (
  query: RxQuery,
  [head, ...tail]: Array<[string | undefined, string | number | undefined]>
): RxQuery => {
  const [key, value] = head || [];
  const nextQuery = key && value !== undefined ? query.where(key).eq(value) : query;
  return tail.length > 0 ? applyFilter(nextQuery, tail) : nextQuery;
};

/**
 * Remove all the unnecessary properties inside the clip object
 *
 * @return a normalized clip
 */
const normalize = ({
  id,
  plainText,
  richText,
  htmlText,
  dataURI,
  category,
  type,
  formats,
  updatedAt,
  createdAt,
}: ClipDoc) => ({
  id,
  plainText,
  richText,
  htmlText,
  dataURI,
  category,
  type,
  formats,
  updatedAt,
  createdAt,
});

export const utils = {
  patterns: { likeSearch, advancedSearch },
  query: { applyFilter },
  clip: { normalize },
};
