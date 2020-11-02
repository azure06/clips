<template>
  <div>
    <!-- Toolbar -->
    <v-toolbar color="surfaceVariant">
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ roomStream.roomName }}</v-toolbar-title>
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
      <div
        v-if="loadingMessages"
        style="height: 120px; width: 100%"
        class="py-4"
        flat
        tile
      >
        <v-row justify="center" align="center">
          <v-progress-circular
            indeterminate
            color="cyan darken-2"
            size="50"
          ></v-progress-circular>
        </v-row>
        <v-row align="center" justify="center" class="text-center">
          <v-subheader class="text-center overline"
            >Loading more data...</v-subheader
          >
        </v-row>
      </div>

      <!-- Messages -->
      <!-- TODO Consider to create a component -->

      <div class="pa-2  d-flex flex-column" style="width: 100%">
        <template v-for="(message, index) in roomStream.messages">
          <v-card
            v-if="message.date"
            flat
            color="transparent"
            class="caption d-flex justify-center"
            :key="`divider-${message.id}`"
          >
            <div>{{ message.date }}</div>
          </v-card>
          <v-card
            :key="`content-${message.id}`"
            flat
            :dark="message.isThisDevice"
            :class="
              `my-2 ${
                message.isThisDevice ? 'align-self-start' : 'align-self-end'
              }`
            "
            :color="!message.isThisDevice ? 'surfaceVariant' : 'blue darken-2'"
          >
            <v-card-text class="pa-2" style="white-space: pre;">
              <div class="d-flex align-end">
                <!-- Content -->
                <template v-if="!message.isThisDevice">
                  <div style="position: relative;">
                    <div
                      class="d-flex"
                      style="position: absolute; right: 15px; top: -20px"
                    >
                      <!-- Status -->
                      <div
                        class="caption mr-1"
                        v-show="
                          message.status === 'read' || message.status === 'sent'
                        "
                      >
                        ✔︎
                      </div>
                      <!-- Staus Error -->
                      <div
                        v-show="
                          message.status === 'pending' ||
                            message.status === 'rejected'
                        "
                        :class="
                          `caption mr-1 ${
                            message.status === 'pending'
                              ? 'infinite-spinning'
                              : ''
                          } `
                        "
                      >
                        <v-btn
                          x-small
                          icon
                          :disabled="message.status === 'pending'"
                          @click="
                            $emit('resend-message', room, room.messages[index])
                          "
                        >
                          <v-icon>{{
                            message.status === 'rejected'
                              ? 'mdi-reload-alert'
                              : 'mdi-loading'
                          }}</v-icon>
                        </v-btn>
                      </div>
                      <!-- Time -->
                      <div class="caption">{{ message.time }}</div>
                    </div>
                  </div>
                  <div class="subtitle-2">
                    {{ message.content }}
                  </div>
                </template>
                <template v-else>
                  <div class="subtitle-2">
                    {{ message.content }}
                  </div>
                  <div style="position: relative;">
                    <div
                      class="d-flex"
                      style="position: absolute; left: 15px; top: -20px"
                    >
                      <!-- Time -->
                      <div class="caption">{{ message.time }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </div>
    </v-container>

    <!-- Toolbar -->

    <div class="d-flex justify-space-between">
      <div class="surfaceVariant fill-height" style="width: 100%">
        <v-textarea
          :value="draft"
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
          @click="$emit('send-message', room, draft)"
        >
          Send
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Room as RoomType } from '@/store/types';

import { fromEvent, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators';
import { MessageDoc } from '@/rxdb/message/model';
import moment from 'moment';
import { WatchObservable } from 'vue-rx';

type RoomEx = Omit<RoomType, 'messages'> & {
  messages: Array<
    MessageDoc & { isThisDevice?: boolean; time?: string; date?: string }
  >;
};

@Component<Room>({
  subscriptions() {
    return {
      roomStream: this.$watchAsObservable(() => this.room, {
        immediate: true,
      })
        .pipe(
          map(({ oldValue, newValue }: WatchObservable<RoomEx>) => ({
            force: oldValue === undefined, // force scroll
            room: {
              ...newValue,
              messages: newValue.messages.map((message, index) => ({
                ...message,
                isThisDevice:
                  this.room.userIds[0] === message.senderId ||
                  message.senderId === 'unknown',
                time: moment(message.createdAt).format('HH:mm'),
                date: (() => {
                  const previousMessage = newValue.messages[index - 1];
                  if (
                    !previousMessage ||
                    moment(previousMessage.createdAt).isBefore(
                      message.createdAt,
                      'day'
                    )
                  ) {
                    const date = moment(message.createdAt);
                    return date.isSame(moment(), 'day')
                      ? 'Today'
                      : date.isSame(moment(), 'week')
                      ? moment(date).format('dddd')
                      : moment(date).format('ddd, MMMM DD, YYYY');
                  }
                })(),
              })),
            },
          }))
        )
        .pipe(tap(({ force }) => this.scrollToEnd({ force })))
        .pipe(map(({ room }) => room)),

      unreadMessagesStream: this.$watchAsObservable(() => this.unreadCount, {
        immediate: true,
      }).pipe(
        filter(({ newValue }) => newValue > 0),
        tap(() => {
          // Set messages status to read
          this.$emit('message-read', {
            roomId: this.room.id,
            senderId: this.room.userIds[0],
          });
        })
      ),
    };
  },
})
export default class Room extends Vue {
  @Prop({ required: true })
  public room!: RoomType;
  @Prop({ required: true })
  public draft!: string;
  @Prop({ default: false })
  public loadingMessages!: boolean;
  @Prop({ default: false })
  public sendingMessage!: boolean;
  @Prop({ default: 0 })
  public unreadCount!: number;

  public get toolbarHeight(): number {
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

  public get containerStyle(): string {
    const headerHeight = this.$vuetify.breakpoint.mdAndDown ? 56 : 64;
    const progressbarHeight = this.sendingMessage ? 4 : 0;
    return `height: calc(100vh - ${this.toolbarHeight +
      headerHeight +
      progressbarHeight}px); overflow: auto;`;
  }

  public get textareaRows(): number {
    const rows = this.draft.split('\n').length;
    return rows >= 1 && rows <= 3 ? rows : rows > 3 ? 3 : 1;
  }

  public infiniteScroll(): Observable<boolean> {
    return fromEvent(
      this.$el.querySelector('#scroll-target') as Element,
      'scroll'
    ).pipe(
      map((event) => {
        const target = event.target as Element;
        return (
          target.scrollTop === 0 && target.clientHeight < target.scrollHeight
        );
      }),
      distinctUntilChanged(),
      filter((value) => value && !this.loadingMessages),
      debounceTime(100)
    );
  }

  public scrollToEnd(options?: { force: boolean }): void {
    this.$nextTick(() => {
      const target = this.$el.querySelector('#scroll-target') as Element;
      const scrollY = target.scrollTop;
      const visiblePortion = target.clientHeight;
      const pageHeight = target.scrollHeight;
      if (options?.force || visiblePortion + scrollY >= pageHeight - 200) {
        target.scrollTop = pageHeight;
      }
    });
  }

  public mounted(): void {
    this.$subscribeTo(this.infiniteScroll(), () => {
      this.$emit('load-messages', this.room.id, {
        skip: this.room.messages.length,
        limit: 20,
      });
    });
  }
}
</script>

<style scoped>
/* lang="scss" doesnt work */
.v-textarea >>> .v-text-field__details {
  display: none;
}

.infinite-spinning {
  animation: infinite-spinning 1s linear infinite;
}
@keyframes infinite-spinning {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
