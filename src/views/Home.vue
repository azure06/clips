<template>
  <div class="fill-height">
    <!-- Application bar -->
    <AppBar :translations="$translations" :time="dateTime" :count="clipCount" />
    <v-container
      fluid
      pa-0
      ma-0
      :class="`container ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`"
      ref="scroll-target"
    >
      <Grid
        :clipsObserver="clipsObserver"
        :clips="clips"
        :labels="labels"
        :loading="loading"
        :displayType="displayType"
        :clipboardMode="clipboardMode"
        :removeTarget="removeTarget"
        :viewMode="viewMode"
        @clip-hover="onClipHover"
        @clip-click="onClipClick"
        @label-click="onLabelClick"
        @label-select="onLabelSelect"
        @go-next="goNext"
        @remove-click="onRemoveClick"
        @edit-label="modifyLabel"
        @remove-label="removeLabel"
        @create-label="addLabel"
      />
    </v-container>

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
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="blue darken-2" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <!-- Search bar -->
    <SearchBar
      @change-mode="onChangeMode"
      @change-type="(type) => search(normalizeQuery(searchQuery, { type }))"
      @remove-items="onRemoveItems"
      @query-change="(value) => search(normalizeQuery(value))"
      @download-json="fromDump().then(downloadJson)"
      @upload-json="uploadJson"
      @sync-with-drive="syncWithDrive"
      @focus="onSearchBarFocus"
      @change-view-mode="(value) => (viewMode = value)"
      :translations="$translations"
      :type="searchConditions.filters.type"
      :sync-status="syncStatus"
      :clipboardMode="clipboardMode"
      :viewMode="viewMode"
      :searchQuery="searchQuery"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { fromEvent } from 'rxjs';
import AppBar from '@/components/AppBar.vue';
import SearchBar from '@/components/SearchBar.vue';
import Grid from '@/components/Grid.vue';
import { Clip, Label, User } from '@/store/types';
import { Getter, Action, Mutation } from 'vuex-class';
import { ClipSearchConditions, SearchFilters } from '@/rxdb/clips/model';
import * as utils from '@/rxdb/clips/utils';
import { ExtendedVue } from '@/utils/base-vue';
import moment from 'moment';
import electron from 'electron';
import {
  map,
  filter,
  concatMap,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { WatchObservable } from 'vue-rx';

type ClipEx = Clip & { fromNow?: string; preview?: string };

@Component<Home>({
  components: { AppBar, SearchBar, Grid },
  subscriptions() {
    return {
      clipsObserver: this.$watchAsObservable(() => this.clips).pipe(
        tap(({ newValue }: WatchObservable<ClipEx[]>) => {
          const { displayType } = this;
          // TODO Consider to improve this implementation
          newValue.forEach((clip) => {
            if (!displayType[clip.id]) {
              displayType[clip.id] = {
                availableTypes: (clip.type === 'text'
                  ? [
                      clip.plainText ? ('plainText' as const) : undefined,
                      clip.richText ? ('richText' as const) : undefined,
                      clip.htmlText ? ('htmlText' as const) : undefined,
                      clip.dataURI ? ('dataURI' as const) : undefined,
                    ]
                  : [
                      clip.dataURI ? ('dataURI' as const) : undefined,
                      clip.htmlText ? ('htmlText' as const) : undefined,
                      clip.richText ? ('richText' as const) : undefined,
                      clip.plainText ? ('plainText' as const) : undefined,
                    ]
                ).filter((value) => !!value) as Array<
                  'plainText' | 'richText' | 'dataURI' | 'htmlText'
                >,
                index: 0,
              };
            }
          });
        }),
        map(({ newValue }) => {
          return newValue.map((clip) => ({
            ...clip,
            icon:
              clip.type === 'text' ? 'mdi-clipboard-text' : 'mdi-image-area',
            iconClass: `${
              clip.type === 'text' ? 'blue darken-2' : 'cyan darken-2'
            } white--text`,
            preview: (clip.plainText || '').substring(0, 255),
            fromNow: moment(clip.updatedAt).fromNow(),
          }));
        })
      ),
    };
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
  public copyToClipboard!: (args: {
    type: 'text' | 'image';
    payload: string;
  }) => Promise<void>;
  @Action('uploadJson', { namespace: 'clips' })
  public uploadJson!: () => Promise<Clip[]>;
  @Action('fromDump', { namespace: 'clips' })
  public fromDump!: () => Promise<Clip[]>;
  @Action('downloadJson', { namespace: 'clips' })
  public downloadJson!: (clips: Clip[]) => Promise<Clip[]>;
  @Action('uploadToDrive', { namespace: 'clips' })
  public uploadToDrive!: (args?: {
    clip: Clip;
    threshold: number;
  }) => Promise<Clip[]>;
  @Mutation('modifyLabel', { namespace: 'labels' })
  public modifyLabel!: (label: Label) => void;
  @Mutation('addLabel', { namespace: 'labels' })
  public addLabel!: (label: Label) => void;
  @Action('removeLabel', { namespace: 'labels' })
  public removeLabel!: (labelId: string) => void;
  @Getter('user', { namespace: 'user' })
  public user!: User;
  @Getter('clips', { namespace: 'clips' })
  public clips!: Clip[];
  @Getter('labels', { namespace: 'labels' })
  public labels!: Label[];
  @Getter('loading', { namespace: 'clips' })
  public loading!: boolean;
  @Getter('processing', { namespace: 'clips' })
  public processing!: Clip[];
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
  public displayType: {
    [id: string]: {
      availableTypes: Array<'plainText' | 'richText' | 'dataURI' | 'htmlText'>;
      index: number;
    };
  } = {};
  public dateTime: number = Date.now();

  public snackbar = false;
  public snackbarText = '';
  public viewMode: 'list' | 'grid' = 'list';
  public searchQuery = '';

  public get clipCount(): number {
    return this.clipboardMode === 'select'
      ? Object.entries(this.removeTarget).length
      : this.clips.length;
  }

  public onClipHover(clip: ClipEx): void {
    this.dateTime = clip.updatedAt;
  }

  public goNext(event: Event, id: string): void {
    event.stopPropagation();
    const target = this.displayType[id];
    this.displayType = {
      ...this.displayType,
      [id]: {
        availableTypes: target.availableTypes,
        index:
          target.index + 1 < target.availableTypes.length
            ? target.index + 1
            : 0,
      },
    };
  }

  public onClipClick(clip: Clip): void {
    const target = this.displayType[clip.id];
    const type = target.availableTypes[target.index];
    this.copyToClipboard({
      type: type === 'dataURI' ? 'image' : 'text',
      payload: clip[type],
    });
    const mainWindow = electron.remote.getCurrentWindow();
    if (mainWindow.isVisible() && this.settings.system.blur) {
      setTimeout(mainWindow.hide, 0);
    }
  }

  public async onLabelSelect(label: Label, clip: Clip): Promise<void> {
    await this.modifyClip({
      clip: {
        ...clip,
        category: !label.id ? 'none' : label.id,
      },
      options: { silently: true },
    });
  }

  public async onRemoveClick(event: Event, clip: ClipEx): Promise<void> {
    event.stopPropagation();
    this.removeTarget = {
      ...this.removeTarget,
      [clip.id]: !this.removeTarget[clip.id],
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
      if (!args) {
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
          switch (this.settings.storage.search.type) {
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

      this.searchConditions = {
        ...this.searchConditions,
        regex,
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
  height: calc(100vh - 129px);
  overflow: auto;
}
.container.small {
  height: calc(100vh - 113px);
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
