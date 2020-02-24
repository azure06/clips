<template>
  <div class="fill-height">
    <!-- Application bar -->
    <AppBar :time="dateTime" :count="clipCount" />
    <v-container
      fluid
      pa-0
      ma-0
      :class="`container ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`"
      ref="scroll-target"
    >
      <v-list two-line subheader dense nav>
        <v-list-item
          v-for="(clip, index) in clipsObserver"
          :key="clip.id"
          @mouseover="onClipHover(clip)"
          @click="onClipClick(clip)"
        >
          <v-list-item-avatar size="40">
            <v-icon :class="clip.iconClass" v-text="clip.icon"></v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              v-if="clip.type === 'text'"
              v-text="clip.preview"
            ></v-list-item-title>
            <v-img
              v-else-if="clip.dataURI"
              style="border-radius: 5px; max-height: 80px;"
              :src="clip.dataURI"
              :alt="clip.preview"
            ></v-img>
            <v-list-item-title v-else>
              {{ clip.plainText }}
            </v-list-item-title>
            <v-list-item-subtitle v-text="clip.fromNow"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action class="pa-0 pl-2 ma-0" v-if="mode !== 'select'">
            <v-btn icon @click="onStarClick($event, clip)">
              <v-icon
                :color="
                  `${
                    clip.category === 'starred'
                      ? clip.type === 'text'
                        ? 'blue darken-2'
                        : 'cyan darken-2'
                      : 'blue-gray'
                  }`
                "
                >mdi-star</v-icon
              >
            </v-btn>
          </v-list-item-action>
          <v-list-item-action class="pa-0 pl-2 pr-2 ma-0" v-else>
            <v-checkbox
              :input-value="removeTarget[clip.id]"
              color="cyan darken-2"
              @click="onRemoveCLick($event, clip, index)"
            ></v-checkbox>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <!-- Loading circle -->

      <transition name="fade">
        <div v-show="loading">
          <v-row align="center" justify="center" style="margin-top: 1.5rem; margin-bottom: 1rem;">
            <v-progress-circular
              indeterminate
              color="cyan darken-2"
              size="50"
            ></v-progress-circular>
          </v-row>
          <v-row align="center" justify="center" class="text-center">
            <v-subheader class="text-center overline">Loading more data...</v-subheader>
          </v-row>
        </div>
      </transition>
    </v-container>

    <!-- Search bar -->
    <SearchBar
      @change-mode="onChangeMode"
      @change-type="onChangeType"
      @change-category="onChangeCategory"
      @remove-items="onRemoveItems"
      @query-change="search"
      :type="searchConditions.filters.type"
      :category="searchConditions.filters.category"
      :sync-status="syncStatus"
      :mode="mode"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import Observable, { fromEvent, Subject, merge } from 'rxjs';
import AppBar from '@/components/AppBar.vue';
import SearchBar from '@/components/SearchBar.vue';
import { Clip, SettingsState } from '@/store/types';
import { Getter, Mutation, Action } from 'vuex-class';
import { ClipSearchConditions, SearchFilters } from '@/rxdb/clips.models';
import { utils } from '@/rxdb';
import moment from 'moment';
import electron from 'electron';
import {
  tap,
  map,
  filter,
  concatMap,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';

type ClipEx = Clip & { fromNow?: string; preview?: string };

@Component({
  components: { AppBar, SearchBar },
  subscriptions() {
    return {
      clipsObserver: this.$watchAsObservable('clips').pipe(
        map(({ oldValue, newValue }: { oldValue: ClipEx[]; newValue: ClipEx[] }) => {
          return newValue.map((clip, index) => ({
            ...clip,
            icon: clip.type === 'text' ? 'mdi-clipboard-text' : 'mdi-image-area',
            iconClass: `${clip.type === 'text' ? 'blue darken-2' : 'cyan darken-2'} white--text`,
            preview: (clip.plainText || '').substring(0, 255),
            fromNow: moment(clip.updatedAt).fromNow(),
          }));
        })
      ),
    };
  },
})
export default class Home extends Vue {
  @Action('loadClips', { namespace: 'clips' })
  public loadClips!: (searchConditions: Partial<ClipSearchConditions>) => Promise<Clip[]>;
  @Action('loadNext', { namespace: 'clips' })
  public loadNext!: (searchConditions: Partial<ClipSearchConditions>) => Promise<Clip[]>;
  @Action('modifyClip', { namespace: 'clips' })
  public modifyClip!: (payload: {
    clip: Clip;
    options?: { silently?: boolean };
  }) => Promise<Clip[]>;
  @Action('removeClips', { namespace: 'clips' })
  public removeClips!: (ids: string[]) => Promise<Clip[]>;
  @Action('copyToClipboard', { namespace: 'clips' })
  public copyToClipboard!: (clip: Clip) => Promise<void>;
  @Getter('clips', { namespace: 'clips' })
  public clips!: Clip[];
  @Getter('loading', { namespace: 'clips' })
  public loading!: boolean;
  @Getter('syncStatus', { namespace: 'clips' })
  public syncStatus?: 'pending' | 'resolved' | 'rejected';
  @Getter('settings', { namespace: 'settings' })
  public settings!: SettingsState;
  public searchConditions: Partial<ClipSearchConditions> & { filters: Partial<SearchFilters> } = {
    limit: 15,
    sort: '-updatedAt',
    filters: {},
  };
  public mode: 'normal' | 'select' = 'normal';
  public removeTarget: { [id: string]: boolean } = {};
  public dateTime: number = Date.now();

  public get clipCount() {
    return this.mode === 'select' ? Object.entries(this.removeTarget).length : this.clips.length;
  }

  public async onClipHover(clip: ClipEx) {
    this.dateTime = clip.updatedAt;
  }

  public async onClipClick(clip: Clip) {
    this.copyToClipboard(clip);
    const mainWindow = electron.remote.getCurrentWindow();
    if (mainWindow.isVisible() && this.settings.system.blur) {
      mainWindow.hide();
    }
  }

  public async onStarClick(event: Event, clip: Clip) {
    event.stopPropagation();
    const result = await this.modifyClip({
      clip: {
        ...clip,
        category: clip.category === 'starred' ? 'none' : 'starred',
      },
      options: { silently: true },
    });
  }

  public async onRemoveCLick(event: Event, clip: ClipEx, index: number) {
    event.stopPropagation();
    this.removeTarget = {
      ...this.removeTarget,
      [clip.id]: !this.removeTarget[clip.id],
    };
  }

  public async onRemoveItems() {
    const removeTarget = this.removeTarget;
    this.removeTarget = {};
    const ids = Object.entries(removeTarget).reduce(
      (acc, [key, value]) => (value ? [key, ...acc] : acc),
      [] as string[]
    );
    const removed = await this.removeClips(ids);
    this.mode = 'normal';
  }

  public onChangeMode(mode: 'normal' | 'select') {
    this.mode = mode;
  }

  public onChangeType(type?: 'text' | 'image') {
    this.searchConditions.filters = {
      ...this.searchConditions.filters,
      type,
    };
    return this.loadClips(this.searchConditions);
  }

  public onChangeCategory(category?: 'none' | 'starred') {
    this.searchConditions.filters = {
      ...this.searchConditions.filters,
      category,
    };
    return this.loadClips(this.searchConditions);
  }

  public timeout?: NodeJS.Timeout;
  public search(value: string) {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      const regex = (() => {
        if (value) {
          switch (this.settings.storage.search.type) {
            case 'fuzzy':
              return utils.patterns.likeSearch('plainText', value);
            case 'advanced-fuzzy':
              return utils.patterns.advancedSearch('plainText', value.split(' '));
          }
        }
      })();

      this.searchConditions = {
        ...this.searchConditions,
        regex,
        filters:
          value && !regex
            ? { ...this.searchConditions.filters, plainText: value }
            : { ...this.searchConditions.filters, plainText: undefined },
      };

      return this.loadClips(this.searchConditions);
    }, 500);
  }

  public infiniteScroll() {
    return fromEvent(this.$refs['scroll-target'] as Element, 'scroll').pipe(
      map((event) => {
        const scrollY = (event.target! as Element).scrollTop;
        const visiblePortion = (event.target! as Element).clientHeight;
        const pageHeight = (event.target! as Element).scrollHeight;
        const isBottom = visiblePortion + scrollY >= pageHeight;
        return isBottom;
      }),
      distinctUntilChanged(),
      filter((value) => value && !this.loading),
      debounceTime(100)
    );
  }

  public async mounted() {
    this.loadClips(this.searchConditions);
    this.$subscribeTo(
      this.infiniteScroll().pipe(concatMap(() => this.loadNext(this.searchConditions))),
      (value) => {
        const target = this.$refs['scroll-target'] as Element;
        if (value.length === 0) {
          const scrollTop = Math.floor(target.scrollTop * 0.9);
          const threshold = 1000;
          target.scrollTo({
            top: scrollTop > threshold ? scrollTop : threshold,
          });
        }
      }
    );
  }
}
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 130px);
  overflow: auto;
}
.container.small {
  height: calc(100vh - 114px);
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
