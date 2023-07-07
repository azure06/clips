import path from 'path';
import { Worker } from 'worker_threads';
import {
  BehaviorSubject,
  Observable,
  Subject,
  concatMap,
  filter,
  from,
  lastValueFrom,
  mergeScan,
  take,
  tap,
} from 'rxjs';
import { uuid } from 'uuidv4';
import { SearchFilters } from '@/rxdb-v2/src/internal/clips/model';
import { Clip, ClipSearchConditions } from '@/rxdb-v2/src/types';
import { Result__, isSuccess, toFailure, toSuccess } from '@/utils/result';

declare const __static: string;

type ClipSubject = {
  uuid: string;
  searchCondition: Partial<ClipSearchConditions>;
  state:
    | ['start', never[]]
    | ['continue', Clip[]]
    | ['end', Clip[]]
    | ['error', string];
  excludeClips: number;
  onCompletion: (result: Result__<Clip[]>) => void;
};

type ClipSubjectW = ClipSubject & {
  worker: Worker;
  documentsCount: number;
};

type LoadingState = ['idle'] | ['running', number, number];

export const clipsWorker = (
  countAllDocuments: (
    args?: Partial<SearchFilters>
  ) => Promise<Result__<number>>,
  findClips: (args: Partial<ClipSearchConditions>) => Promise<Result__<Clip[]>>
): [
  Observable<LoadingState>,
  (args: Partial<ClipSearchConditions>) => Promise<Result__<Clip[]>>
] => {
  const reducer = new BehaviorSubject<ClipSubject | null>(null);
  const completionRate = new Subject<LoadingState>();
  reducer
    .pipe(tap(() => console.info('init-search:')))
    .pipe(filter((value): value is ClipSubject => value !== null))
    .pipe(
      mergeScan<ClipSubject, ClipSubjectW | null>(
        (prev, { searchCondition, ...rest }) =>
          from(
            Promise.resolve().then(async () => {
              const [flow] = rest.state;
              if (flow === 'start') {
                const _ = await (prev?.worker?.terminate() ??
                  Promise.resolve(0));
                prev?.onCompletion(
                  prev.state[0] !== 'error'
                    ? toSuccess(prev.state[1])
                    : toFailure(prev.state[1])
                );
                // Init if the it's starting a new worker
                completionRate.next(['running', 0, searchCondition.limit ?? 0]);
              }
              const [newSearchCondition, regex] =
                searchCondition?.regex && 'plainText' in searchCondition.regex
                  ? [
                      { ...searchCondition, regex: undefined },
                      searchCondition.regex.plainText.$regex,
                    ]
                  : [searchCondition, undefined];
              return {
                ...rest,
                documentsCount: await countAllDocuments(
                  searchCondition.filters
                ).then((dc) => (dc.status === 'success' ? dc.data : 0)),
                searchCondition, // Propagate the original conditions
                initialSkip: searchCondition.skip ?? 0,
                worker: new Worker(path.join(__static, '/worker.js'), {
                  workerData: await findClips(newSearchCondition).then(
                    (result) => ({
                      data: isSuccess(result) ? result.data : [],
                      regex,
                    })
                  ),
                }),
              };
            })
          ),
        null
      )
    )
    .pipe(filter((v): v is ClipSubjectW => v !== null))
    .pipe(tap((result) => console.info('find:', result.state[0])))
    .pipe(
      concatMap(
        (clipSub) =>
          new Promise<ClipSubjectW>((resolve) => {
            clipSub.worker.on('message', async (clips: Clip[]) => {
              const clipsTotal =
                clipSub.state[0] !== 'start' && clipSub.state[0] !== 'error'
                  ? [...clipSub.state[1], ...clips]
                  : clips;
              const latest = await lastValueFrom(
                reducer.asObservable().pipe(take(1))
              );
              if (
                (latest === null || latest.uuid === clipSub.uuid) &&
                (clipSub.searchCondition.skip ?? 0) < clipSub.documentsCount &&
                clipsTotal.length - clipSub.excludeClips <
                  (clipSub.searchCondition.limit ?? Infinity)
              ) {
                completionRate.next([
                  'running',
                  Math.max(clipsTotal.length - clipSub.excludeClips, 0),
                  clipSub.searchCondition.limit ?? 0,
                ]);
                resolve({
                  ...clipSub,
                  state: ['continue', clipsTotal],
                  searchCondition: {
                    ...clipSub.searchCondition,
                    skip: (clipSub.searchCondition.skip ?? 0) + 15,
                  },
                });
              } else {
                completionRate.next(['idle']);
                resolve({ ...clipSub, state: ['end', clipsTotal] });
              }
            });
            clipSub.worker.on('error', (error) => {
              completionRate.next(['idle']);
              resolve({
                ...clipSub,
                state: ['error', `${error.name}:${error.message}`],
              });
            });
            clipSub.worker.on('exit', (code) => {
              console.info('exited:', code);
              if (code !== 0)
                // toFailure(`Worker stopped with exit code ${code}`),
                resolve({
                  ...clipSub,
                  state: ['error', `Exit Code ${code}`],
                });
              // else resolve(toSuccess(`Exit Code ${code}`));
            });
          })
      )
    )
    .pipe(tap((result) => console.info('find-result:', result.state[0])))
    .pipe(
      tap(({ state, onCompletion, ...rest }) => {
        switch (state[0]) {
          case 'start':
            onCompletion(toFailure('Impossible state'));
            break;
          case 'continue':
            reducer.next({ ...rest, onCompletion, state });
            break;
          case 'end':
            onCompletion(
              toSuccess(
                state[1].filter((_, index) => index >= rest.excludeClips)
              )
            );
            break;
          case 'error':
            onCompletion(toFailure(state[1]));
            break;
        }
      })
    )
    .subscribe();
  return [
    completionRate.asObservable(),
    (searchCondition: Partial<ClipSearchConditions>) =>
      new Promise((resolve) => {
        reducer.next({
          uuid: uuid(),
          state: ['start', []],
          searchCondition,
          excludeClips: searchCondition.skip ?? 0,
          onCompletion: resolve,
        });
      }),
  ];
};
