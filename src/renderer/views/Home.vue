<template>
  <div class="fill-height">
    <div
      v-if="!isWindowsOrLinux && clipCount !== undefined"
      style="
        display: flex;
        align-items: baseline;
        user-select: none;
        position: fixed;
        top: 0;
        right: 15px;
        z-index: 1;
      "
    >
      <div class="subtitle-2 pa-1 font-weight-bold">{{ clipCount }}</div>
      <div class="caption pa-1 font-weight-regular">
        {{ $translations.items }}
      </div>
    </div>
    <v-container ref="scroll-target" fluid pa-0 ma-0 class="container">
      <Grid
        ref="clips-grid"
        :clipsObserver="clipsObserver"
        :labels="labels"
        :loading="loading"
        :clipboardMode="clipboardMode"
        :removeTarget="removeTarget"
        :viewMode="viewMode"
        :translations="$translations"
        @focus="([index, value]) => focusEventSubject.next([index, value])"
        @hover="([index, value]) => (clipHover = [index, value])"
        @clip-click="onClipClick"
        @label-click="onLabelClick"
        @label-select="onLabelSelect"
        @change-format="(formatMap) => clipsFormatSubject.next(formatMap)"
        @open-menu="(clipMap) => clipsOpenMenuSubject.next(clipMap)"
        @remove-click="onRemoveClick"
        @edit-label="modifyLabel"
        @remove-label="removeLabel"
        @create-label="addLabel"
        @edit-image="(index) => editImage(clips[index])"
        @edit-text="editText"
        @open-with-editor="withCommand"
      />
    </v-container>

    <!-- Edit Text -->
    <v-dialog v-model="editingOpen" width="500">
      <v-card>
        <v-card-title>
          {{ $translations.edit }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="editingText"
            :label="$translations.text"
            counter
            full-width
            outlined
          ></v-textarea>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="
              () => {
                editingOpen = false;
                modifyClip({
                  clip: {
                    ...clips[editingClipIndex],
                    plainText: editingText,
                  },
                  options: { silently: true },
                });
              }
            "
          >
            {{ $translations.save }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog -->
    <v-dialog v-model="processing" hide-overlay persistent width="300">
      <v-card color="blue darken-2" dark>
        <v-card-text>
          {{ $translations.mightTakeSeveralMinutes }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog -->
    <v-snackbar
      v-model="snackbar"
      :color="$vuetify.theme.dark ? 'surface' : 'primary'"
      timeout="1000"
    >
      {{ snackbarText }}
    </v-snackbar>

    <!-- Search bar -->
    <SearchBar
      @change-mode="onChangeMode"
      @change-type="(type) => search(normalizeQuery(searchQuery, { type }))"
      @remove-items="onRemoveItems"
      @query-change="(value) => search(normalizeQuery(value))"
      @create-backup="fromDump().then(createBackup)"
      @restore-backup="restoreBackup"
      @sync-with-drive="syncWithDrive"
      @focus="onSearchBarFocus"
      @change-view-mode="(value) => (viewMode = value)"
      @picker-change="onPickerChange"
      ref="clips-searchbar"
      :translations="$translations"
      :type="searchConditions.filters.type"
      :sync-status="syncStatus"
      :clipboardMode="clipboardMode"
      :viewMode="viewMode"
      :searchQuery="searchQuery"
      :startDate="startDate"
      :endDate="endDate"
      :pickerOptions="pickerOptions"
    />
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { Subject, combineLatest, fromEvent, Observable } from 'rxjs';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Component } from 'vue-property-decorator';
import { Action, Getter, Mutation } from 'vuex-class';

import { Data } from '@/electron/services/clipboard';
import AppBar from '@/renderer/components/AppBar.vue';
import Grid from '@/renderer/components/Grid.vue';
import SearchBar from '@/renderer/components/SearchBar.vue';
import * as remote from '@/renderer/invokers/remote';
import { copySilently } from '@/renderer/store/clips/actions';
import { Clip, Label, User } from '@/renderer/store/types';
import { ExtendedVue } from '@/renderer/utils/basevue';
import {
  ClipSearchConditions,
  Format,
  SearchFilters,
} from '@/rxdb/clips/model';
import * as utils from '@/rxdb/clips/utils';
import { always, whenLinux, whenWindows } from '@/utils/environment';

export type ClipFormat =
  | 'all'
  | 'plainText'
  | 'richText'
  | 'htmlText'
  | 'dataURI';

export type ClipsFormatMap = { [clipdId: string]: ClipFormat | undefined };
export type ClipsOpenMap = {
  [clipId: string]: { open: boolean; client: [string, string] | undefined };
};

export type ClipExtended = Clip & {
  fromNow?: string;
  preview?: string;
  displayingFormat?: ClipFormat;
  menuState: ClipsOpenMap[string];
};

export const toClipProp = (type?: Format | string): ClipFormat => {
  switch (type) {
    case 'text/plain':
      return 'plainText';
    case 'text/html':
      return 'htmlText';
    case 'text/rtf':
      return 'richText';
    case 'image/png':
      return 'dataURI';
    case 'image/jpg':
      return 'dataURI';
    case 'vscode-editor-data':
      return 'htmlText';
    default:
      return 'plainText';
  }
};

const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const KEY_F = 'KeyF';
const KEY_N = 'KeyN';

@Component<Home>({
  components: { AppBar, SearchBar, Grid },
  subscriptions() {
    const keyboardEvent = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      withLatestFrom(
        this.focusEventSubject
          .asObservable()
          .pipe(startWith([null, false] as const))
      ),
      tap(([event, [index]]) => {
        const moveNextPrev = async (args: 'next' | 'previous') => {
          const targetIndex =
            index !== null ? (args === 'next' ? index + 1 : index - 1) : 0;
          const [item] =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.$refs[`clips-grid`] as any)?.$refs[
              `clip-item-${targetIndex}`
            ] || [];

          if (item !== undefined) {
            item?.$el?.focus();
            this.focusEventSubject.next([targetIndex, true]);
          }
        };
        switch (event.code) {
          case ARROW_UP:
            return moveNextPrev('previous');
          case ARROW_DOWN:
            return moveNextPrev('next');
          case KEY_F: {
            // Why the parents knows about the children...? For sake of simplicity...
            if (event.metaKey || event.ctrlKey) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (this.$refs as any)['clips-searchbar']?.$refs[
                'clips-searchbar-text'
              ]?.focus();
            }
            break;
          }
          default:
            return void 0;
        }
      })
    );
    const clipsObserver: Observable<ClipExtended[]> = combineLatest([
      this.clipsFormatSubject
        .asObservable()
        .pipe(scan((acc: ClipsFormatMap, value) => ({ ...acc, ...value }), {}))
        .pipe(startWith({} as ClipsFormatMap)),
      this.clipsOpenMenuSubject
        .asObservable()
        .pipe(
          scan(
            (acc: ClipsOpenMap, value) => ({
              ...(Object.keys(acc).reduce(
                (acc, key) => ({ ...acc, [key]: { open: false } }),
                {}
              ) as ClipsOpenMap),
              ...value,
            }),
            {}
          )
        )
        .pipe(startWith({} as ClipsOpenMap)),
      this.$watchAsObservable(() => this.clips),
    ]).pipe(
      map(([clipsFormatMap, clipsOpenMap, { newValue: clips }]) =>
        clips.map(
          (clip): ClipExtended => ({
            ...clip,
            formats: clip.formats.filter(
              (format) => format !== 'vscode-editor-data'
            ),
            preview: (clip.plainText || '').substring(0, 255),
            displayingFormat:
              clipsFormatMap[clip.id] ||
              (clip.type === 'image'
                ? clip.richText //  In this case very likely is from MS Office
                  ? 'all'
                  : 'dataURI'
                : 'plainText'),
            fromNow: moment(clip.updatedAt).fromNow(),
            menuState: clipsOpenMap[clip.id] ?? { open: false },
          })
        )
      )
    );
    const withCommandObs = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter(
        (event) => event.code === KEY_N && (event.metaKey || event.ctrlKey)
      ),
      withLatestFrom(this.focusEventSubject.asObservable(), clipsObserver),
      tap(([_, [focusIndex, focussed], clips]) => {
        const [hoverIndex, hovered] = this.clipHover;
        const target = hovered ? hoverIndex : focussed ? focusIndex : null;
        const clip = clips.find((_, index) => index === target);
        if (clip)
          this.withCommand(
            (() => {
              switch (clip.displayingFormat) {
                case 'plainText':
                  return {
                    format: 'plain/text',
                    data: clip.plainText,
                  };
                case 'richText':
                  return {
                    format: 'text/rtf',
                    data: clip.richText,
                  };
                case 'htmlText':
                  return {
                    format: 'text/html',
                    data: clip.htmlText,
                  };
                case 'dataURI':
                  return {
                    format: 'image/png',
                    data: clip.dataURI,
                  };
                default:
                  return {
                    format: 'plain/text',
                    data: clip.plainText,
                  };
              }
            })()
          );
      })
    );

    return { keyboardEvent, clipsObserver, withCommandObs };
  },
})
export default class Home extends ExtendedVue {
  @Action('loadClips', { namespace: 'clips' })
  public loadClips!: (
    searchConditions: Partial<ClipSearchConditions>
  ) => Promise<Clip[]>;
  @Action('loadNext', { namespace: 'clips' })
  public loadNext!: (
    searchConditions: Partial<ClipSearchConditions>
  ) => Promise<Clip[]>;
  @Action('modifyClip', { namespace: 'clips' })
  public modifyClip!: (payload: {
    clip: Clip;
    options?: { silently?: boolean };
  }) => Promise<Clip[]>;
  @Action('removeClips', { namespace: 'clips' })
  public removeClips!: (ids: string[]) => Promise<Clip[]>;
  @Action('copyToClipboard', { namespace: 'clips' })
  public copyToClipboard!: (data: Data) => Promise<void>;
  @Action('restoreBackup', { namespace: 'clips' })
  public restoreBackup!: () => Promise<Clip[]>;
  @Action('fromDump', { namespace: 'clips' })
  public fromDump!: () => Promise<Clip[]>;
  @Action('createBackup', { namespace: 'clips' })
  public createBackup!: (clips: Clip[]) => Promise<Clip[]>;
  @Action('uploadToDrive', { namespace: 'clips' })
  public uploadToDrive!: (args?: {
    clip: Clip;
    threshold: number;
  }) => Promise<Clip[]>;
  @Action('editImage', { namespace: 'clips' })
  public editImage!: (clipId: Clip) => void;
  @Action('withCommand', { namespace: 'clips' })
  public withCommand!: (args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format: any;
    data: string;
  }) => Promise<void>;
  @Action('removeLabel', { namespace: 'configuration' })
  public removeLabel!: (labelId: string) => void;
  @Mutation('modifyLabel', { namespace: 'configuration' })
  public modifyLabel!: (label: Label) => void;
  @Mutation('addLabel', { namespace: 'configuration' })
  public addLabel!: (label: Label) => void;
  @Getter('user', { namespace: 'configuration' })
  public user!: User;
  @Getter('clips', { namespace: 'clips' })
  public clips!: Clip[];
  @Getter('loading', { namespace: 'clips' })
  public loading!: boolean;
  @Getter('processing', { namespace: 'clips' })
  public processing!: boolean;
  @Getter('syncStatus', { namespace: 'clips' })
  public syncStatus?: 'pending' | 'resolved' | 'rejected';
  public searchConditions: Partial<ClipSearchConditions> & {
    filters: Partial<SearchFilters>;
  } = {
    limit: 15,
    sort: '-updatedAt',
    filters: {},
  };
  public clipboardMode: 'normal' | 'select' = 'normal';
  public removeTarget: { [id: string]: boolean } = {};
  public clipsFormatSubject = new Subject<ClipsFormatMap>();
  public clipsOpenMenuSubject = new Subject<ClipsOpenMap>();
  public focusEventSubject = new Subject<[number, boolean]>();
  public clipHover: [number | null, boolean | null] = [null, null]; // Not used anymore

  public snackbar = false;
  public snackbarText = '';
  public viewMode: 'list' | 'grid' = 'list';
  public searchQuery = '';
  public editingOpen = false;
  public editingClipIndex?: number;
  public editingText = '';
  public get pickerOptions() {
    return {
      max: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      min: '2000-01-01',
    };
  }
  endDate = this.pickerOptions.max;
  startDate = (() => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().substr(0, 10);
  })();

  public get isWindowsOrLinux(): boolean {
    return (
      whenWindows(always(true), always(false)) ||
      whenLinux(always(true), always(false))
    );
  }

  public get clipCount(): number {
    return this.clipboardMode === 'select'
      ? Object.entries(this.removeTarget).length
      : this.clips.length;
  }

  public editText(clipIndex: number): void {
    // Shallow copy
    this.editingClipIndex = clipIndex;
    this.editingText = this.clips[clipIndex].plainText;
    this.editingOpen = true;
  }

  public async onClipClick(
    event: MouseEvent,
    clipIndex: number,
    displayingFormat:
      | 'plainText'
      | 'richText'
      | 'dataURI'
      | 'htmlText'
      | undefined
  ): Promise<void> {
    if (event.shiftKey || this.clipboardMode === 'select') {
      this.clipboardMode = 'select';
      this.onRemoveClick(event, clipIndex);
    } else {
      copySilently.next(true);
      await this.copyToClipboard(
        (() => {
          switch (displayingFormat) {
            case 'plainText':
              return {
                text: this.clips[clipIndex].plainText,
              };
            case 'richText':
              return {
                rtf: this.clips[clipIndex].richText,
              };
            case 'dataURI':
              return {
                image: this.clips[clipIndex].dataURI,
              };
            case 'htmlText':
              return {
                html: this.clips[clipIndex].htmlText,
              };
            default:
              return {
                text: this.clips[clipIndex].plainText,
                html: this.clips[clipIndex].htmlText,
                image: this.clips[clipIndex].dataURI,
                rtf: this.clips[clipIndex].richText,
              };
          }
        })()
      );
      this.snackbarText = this.$translations.copiedToClipboard;
      this.snackbar = true;
      const isVisible = await remote.getCurrentWindow('isVisible');
      if (isVisible && this.general.blur) {
        setTimeout(() => remote.getCurrentWindow('hide'), 0);
      }
    }
  }

  public async onLabelSelect(label: Label, clipIndex: number): Promise<void> {
    await this.modifyClip({
      clip: {
        ...this.clips[clipIndex],
        category: !label.id ? 'none' : label.id,
      },
      options: { silently: true },
    });
  }

  public onPickerChange(opt: 'start' | 'end', value: string) {
    switch (opt) {
      case 'start':
        this.startDate = value;
        break;
      case 'end':
        this.endDate = value;
        break;
    }
  }

  public async onRemoveClick(event: Event, clipIndex: number): Promise<void> {
    event.stopPropagation();
    this.removeTarget = {
      ...this.removeTarget,
      [this.clips[clipIndex].id]: !this.removeTarget[this.clips[clipIndex].id],
    };
  }

  public async onRemoveItems(): Promise<void> {
    const removeTarget = this.removeTarget;
    this.removeTarget = {};
    const ids = Object.entries(removeTarget).reduce(
      (acc, [key, value]) => (value ? [key, ...acc] : acc),
      [] as string[]
    );
    await this.removeClips(ids);
    this.clipboardMode = 'normal';
  }

  public onChangeMode(mode: 'normal' | 'select'): void {
    this.clipboardMode = mode;
  }

  public onLabelClick(label: Label): void {
    const target = this.labels.find((label_) => label_.id === label.id);
    this.search(this.normalizeQuery(this.searchQuery, { label: target?.name }));
  }

  public normalizeQuery(
    searchQuery: string,
    args?: { type: 'text' | 'image' } | { label?: 'Starred' | string }
  ):
    | {
        search: string;
        type?: 'text' | 'image';
        label?: string;
      }
    | string {
    try {
      const { type, label, search } = JSON.parse(searchQuery);
      if (search === undefined) {
        // ex. JSON.parse("8") === 8
        throw Error('Query absent');
      } else if (!args) {
        return { type, label, search };
      } else if ('type' in args) {
        return { type: args.type, label, search };
      } else if ('label' in args) {
        return { type, label: args.label, search };
      } else {
        return { type, label, search };
      }
    } catch (e) {
      if (!args) {
        return searchQuery;
      } else if ('type' in args) {
        return { type: args.type, search: searchQuery };
      } else if ('label' in args) {
        return { label: args.label, search: searchQuery };
      } else {
        return searchQuery;
      }
    }
  }

  // eslint-disable-next-line no-undef
  public timeout?: NodeJS.Timeout;
  public search(
    args:
      | {
          search: string;
          type?: 'text' | 'image';
          label?: string;
        }
      | string
  ): void {
    if (this.timeout) clearTimeout(this.timeout);
    const search = typeof args === 'string' ? args : args.search;
    this.timeout = setTimeout(async () => {
      const regex = (() => {
        if (search) {
          switch (this.advanced.searchMode) {
            case 'fuzzy':
              return utils.patterns.likeSearch('plainText', search);
            case 'advanced-fuzzy':
              return utils.patterns.advancedSearch(
                'plainText',
                search.split(' ')
              );
          }
        }
      })();
      const lteDate = new Date(this.endDate);
      lteDate.setDate(lteDate.getDate() + 1);
      lteDate.setMilliseconds(lteDate.getMilliseconds() - 1);
      this.searchConditions = {
        ...this.searchConditions,
        regex,
        gte: new Date(this.startDate).getTime(),
        lte: lteDate.getTime(),
        filters: {
          ...this.searchConditions.filters,
          type: typeof args === 'string' ? undefined : args.type,
          category:
            typeof args === 'string' || !args.label
              ? undefined
              : args.label === 'Starred'
              ? // Starerd is a particular case maintained for back compatibility
                'starred'
              : this.labels.find((label) => label.name === args.label)?.id,
          plainText: search && !regex ? search : undefined,
        },
      };

      this.searchQuery =
        typeof args === 'string'
          ? search
          : JSON.stringify({
              type: args.type,
              label: args.label,
              search: args.search,
            });

      await this.loadClips(this.searchConditions);
      this.viewMode = 'list';
    }, 500);
  }

  public async syncWithDrive(): Promise<void> {
    if (this.user) {
      const clips = await this.uploadToDrive();
      this.snackbarText =
        clips.length > 0
          ? this.$replacer(this.$translations.itemsHaveBeenUploaded, {
              length: clips.length,
            })
          : this.$translations.alreadySyncedWith;
    } else {
      this.snackbarText = 'Sign-in to sync with Google Drive';
    }

    this.snackbar = true;
  }

  public infiniteScroll(): ReturnType<typeof fromEvent> {
    return fromEvent(this.$refs['scroll-target'] as Element, 'scroll').pipe(
      map((event) => {
        const taregt = event?.target as Element; // TODO check for undefined
        const scrollY = taregt.scrollTop;
        const visiblePortion = taregt.clientHeight;
        const pageHeight = taregt.scrollHeight;
        const isBottom = visiblePortion + scrollY >= pageHeight;
        return isBottom;
      }),
      distinctUntilChanged(),
      filter((value) => value && !this.loading),
      debounceTime(100)
    );
  }

  public onSearchBarFocus(): void {
    this.viewMode = 'grid';
  }

  public async mounted(): Promise<void> {
    this.loadClips(this.searchConditions);
    this.$subscribeTo(
      this.infiniteScroll().pipe(
        concatMap(() => this.loadNext(this.searchConditions))
      ),
      () => {
        // const target = this.$refs['scroll-target'] as Element;
        // if (value.length === 0) {
        //   const scrollTop = Math.floor(target.scrollTop * 0.9);
        //   const threshold = 1000;
        //   target.scrollTo({
        //     top: scrollTop > threshold ? scrollTop : threshold,
        //   });
        // }
      }
    );
  }
}
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 78px);
  overflow: auto;
  z-index: -1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
