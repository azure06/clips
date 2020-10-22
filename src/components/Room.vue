<template>
  <div>
    <!-- Toolbar -->
    <v-toolbar color="surfaceVariant">
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ roomObserver.roomName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon disabled>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon disabled>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
    <!-- Sending message -->
    <v-progress-linear
      v-if="sendingMessage"
      indeterminate
      color="yellow darken-2"
    ></v-progress-linear>

    <!-- Container -->
    <v-container
      id="scroll-target"
      class="fill-height ma-0 pa-0 align-start"
      :style="containerStyle"
      fluid
    >
      <!-- Loading Circle -->
      <transition name="fade">
        <div
          v-show="loadingMessages"
          style="height: 120px; width: 100%"
          class="py-4"
          flat
          tile
        >
          <v-row v-if="loadingMessages" justify="center" align="center">
            <v-progress-circular
              indeterminate
              color="cyan darken-2"
              size="50"
            ></v-progress-circular>
          </v-row>
          <v-row
            v-if="loadingMessages"
            align="center"
            justify="center"
            class="text-center"
          >
            <v-subheader class="text-center overline"
              >Loading more data...</v-subheader
            >
          </v-row>
        </div>
      </transition>

      <!-- Messages -->
      <div class="pa-2  d-flex flex-column" style="width: 100%">
        <v-card
          v-for="message in roomObserver.messages"
          :key="message.id"
          flat
          :class="
            `my-1 ${
              message.isThisDevice ? 'align-self-start' : 'align-self-end'
            }`
          "
          :color="!message.isThisDevice ? 'surfaceVariant' : 'blue darken-2'"
        >
          <v-card-text class="pa-3"> {{ message.content }}</v-card-text>
        </v-card>
      </div>
    </v-container>

    <!-- Toolbar -->

    <div class="d-flex justify-space-between">
      <div class="surfaceVariant fill-height" style="width: 100%">
        <v-textarea
          :value="message"
          @keydown="$emit('keydown', room, $event)"
          @input="$emit('change-message', room, $event)"
          class="pa-2 pb-1"
          background-color="background"
          autofocus
          dense
          flat
          solo
          filled
          no-resize
          label="Message..."
          :rows="textareaRows"
        ></v-textarea>
      </div>
      <div
        class="d-flex justify-center align-center surfaceVariant"
        style="width: 100px"
      >
        <v-btn
          color="blue darken-2"
          depressed
          dark
          :loading="sendingMessage"
          @click="$emit('send-message', room, message)"
        >
          Send
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { language } from '@/utils/language';
import { SettingsState } from '@/store/types';
import { Room as RoomType } from '@/store/types';
import { fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators';
import { MessageDoc } from '@/rxdb/message/model';

type RoomEx = Omit<RoomType, 'messages'> & {
  messages: Array<MessageDoc & { isThisDevice?: boolean }>;
};
type Watch<T> = { oldValue: T; newValue: T };

@Component<Room>({
  subscriptions() {
    return {
      roomObserver: this.$watchAsObservable(() => this.room, {
        immediate: true,
      })
        .pipe(
          map(({ oldValue, newValue }: Watch<RoomEx>) => {
            const messages = newValue.messages.map((message) => {
              message.isThisDevice = this.room.userIds[0] === message.senderId;
              return message;
            });
            return {
              force: oldValue === undefined, // force scroll
              room: {
                ...newValue,
                messages,
              },
            };
          })
        )
        .pipe(tap(({ force }) => this.scrollToEnd({ force })))
        .pipe(map(({ room }) => room)),
    };
  },
})
export default class Room extends Vue {
  @Prop({ required: true })
  public room!: RoomType;
  @Prop({ required: true })
  public message!: string;
  @Prop({ default: false })
  public loadingMessages!: boolean;
  @Prop({ default: false })
  public sendingMessage!: boolean;

  public get toolbarHeight() {
    const offset = ((): number => {
      // Not clear why the textarea behave like this
      switch (this.textareaRows) {
        case 1:
          return 0;
        case 2:
          return 22;
        case 3:
          return 25 + 25;
        default:
          return 0;
      }
    })();
    return 57 + offset;
  }

  public get containerStyle() {
    const headerHeight = this.$vuetify.breakpoint.mdAndDown ? 56 : 64;
    const progressbarHeight = this.sendingMessage ? 4 : 0;
    return `height: calc(100vh - ${this.toolbarHeight +
      headerHeight +
      progressbarHeight}px); overflow: auto;`;
  }

  public get textareaRows() {
    const rows = this.message.split('\n').length;
    return rows >= 1 && rows <= 3 ? rows : rows > 3 ? 3 : 1;
  }

  public infiniteScroll() {
    return fromEvent(
      this.$el.querySelector('#scroll-target') as Element,
      'scroll'
    ).pipe(
      map((event) => {
        return (
          (event.target! as Element).scrollTop === 0 &&
          (event.target! as Element).clientHeight <
            (event.target! as Element).scrollHeight
        );
      }),
      distinctUntilChanged(),
      filter((value) => value && !this.loadingMessages),
      debounceTime(100)
    );
  }

  public mounted() {
    this.$subscribeTo(this.infiniteScroll(), () => {
      this.$emit('load-messages', this.room.id, {
        skip: this.room.messages.length,
        limit: 20,
      });
    });
  }

  public scrollToEnd(options?: { force: boolean }) {
    this.$nextTick(() => {
      const target = this.$el.querySelector('#scroll-target') as Element;
      const scrollY = target.scrollTop;
      const visiblePortion = target.clientHeight;
      const pageHeight = target.scrollHeight;
      (window as any).target = target;
      if (options?.force || visiblePortion + scrollY >= pageHeight - 200) {
        target.scrollTop = pageHeight;
      }
    });
  }
}
</script>

<style scoped>
/* lang="scss" doesnt work */
.v-textarea >>> .v-text-field__details {
  display: none;
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
