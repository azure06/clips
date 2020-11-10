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

    <!-- Container -->
    <v-container
      id="scroll-target"
      class="fill-height ma-0 pa-0 align-start"
      fluid
      :style="containerStyle"
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

      <!-- Container DragArea & Messages -->
      <div
        class="pa-2  d-flex flex-column"
        style="width: 100%; position: relative;"
        @dragenter.prevent="dropHandlerSubject.next(['dragenter', $event])"
        @dragleave.prevent="dropHandlerSubject.next(['dragleave', $event])"
        @dragover.prevent="dropHandlerSubject.next(['dragover', $event])"
        @drop.prevent="dropHandlerSubject.next(['drop', $event])"
      >
        <div
          v-show="draggingStream"
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index:10;"
        >
          <div
            class="d-flex flex-column justify-center align-center"
            :style="dropContainerStyle"
          >
            <div class="overline">Drop Here</div>
            <div class="drop-animation">
              <v-icon large>mdi-cloud-upload</v-icon>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <!-- TODO Consider to create a component -->
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
            max-width="70vw"
            flat
            :dark="!message.fromThisDevice"
            :class="
              `my-1 ${
                !message.fromThisDevice ? 'align-self-start' : 'align-self-end'
              }`
            "
            :color="message.fromThisDevice ? 'surfaceVariant' : 'blue darken-2'"
          >
            <v-card-text
              class="pa-1"
              style="white-space: pre-wrap; overflow-wrap: break-word;"
            >
              <div class="d-flex align-end">
                <!-- Content -->
                <template v-if="message.fromThisDevice">
                  <div style="position: relative;">
                    <div
                      class="d-flex"
                      style="position: absolute; right: 10px; top: -20px"
                    >
                      <!-- Status -->
                      <div
                        class="caption mr-1"
                        v-show="isReadOrSent(message.status)"
                      >
                        ✔︎
                      </div>
                      <!-- Staus Error -->
                      <div
                        v-show="isRejectedOrPending(message.status)"
                        :class="
                          `caption mr-1 ${
                            isPending(message.status) ? 'infinite-spinning' : ''
                          } `
                        "
                      >
                        <v-btn
                          x-small
                          icon
                          :disabled="isPending(message.status)"
                          @click="
                            $emit('resend-message', room, room.messages[index])
                          "
                        >
                          <v-icon>{{
                            isRejected(message.status)
                              ? 'mdi-reload-alert'
                              : 'mdi-loading'
                          }}</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                  <div class="caption line-height: 1rem">
                    <div class="caption line-height: 1rem">
                      <div
                        class="font-weight-normal"
                        style="font-size: 0.65rem"
                      >
                        {{ message.time }}
                      </div>
                      <div
                        v-if="message.type === 'text'"
                        class="font-weight-medium"
                      >
                        {{ message.content }}
                      </div>
                      <!-- Progress -->
                      <div
                        v-else
                        style="min-width: 54px"
                        class="d-flex flex-column justify-center align-center"
                      >
                        <v-icon class="move-animation my-1"> mdi-file </v-icon>
                        <v-progress-linear
                          v-if="message.content.progress.percentage !== 100"
                          class="my-1"
                          :value="message.content.progress.percentage"
                          rounded
                          style="width: 50px"
                        ></v-progress-linear>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="caption line-height: 1rem">
                    <div class="font-weight-normal" style="font-size: 0.65rem">
                      {{ message.time }}
                    </div>
                    <div
                      v-if="message.type === 'text'"
                      class="font-weight-medium"
                    >
                      {{ message.content }}
                    </div>
                    <!-- Progress -->
                    <div
                      v-else
                      style="min-width: 54px"
                      class="d-flex flex-column justify-center align-center"
                    >
                      <v-icon class="move-animation my-1"> mdi-file </v-icon>
                      <v-progress-linear
                        v-if="message.content.progress.percentage !== 100"
                        class="my-1"
                        :value="message.content.progress.percentage"
                        rounded
                        style="width: 50px"
                      ></v-progress-linear>
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

import { fromEvent, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  tap,
} from 'rxjs/operators';
import { MessageDoc, MessageStatus, parseContent } from '@/rxdb/message/model';
import moment from 'moment';
import { WatchObservable } from 'vue-rx';

type RoomEx = Omit<RoomType, 'messages'> & {
  messages: Array<
    MessageDoc & { fromThisDevice?: boolean; time?: string; date?: string }
  >;
};

type EventName = 'drop' | 'dragenter' | 'dragleave' | 'dragover';

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
                content:
                  message.type === 'file'
                    ? parseContent(message.content)
                    : message.content,
                fromThisDevice:
                  this.room.userIds[0] !== message.senderId ||
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
      draggingStream: this.dropHandlerSubject.asObservable().pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tap(([eventNm, event]) => {
          if (eventNm === 'drop' && event.dataTransfer) {
            this.$emit(
              'send-file',
              this.room,
              event.dataTransfer.files[0].path
            );
          }
        }),
        map(([head]) => head),
        scan(
          (acc, event) =>
            event !== 'drop'
              ? {
                  ...acc,
                  [event]: (acc[event] || 0) + 1,
                }
              : ({} as { [P in EventName]: number }),
          {} as { [P in EventName]: number }
        ),
        map((event) => event.dragenter !== event.dragleave),
        startWith(false)
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
  @Prop({ default: 0 })
  public unreadCount!: number;

  public dropHandlerSubject = new Subject<[EventName, DragEvent]>();

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

  public get headerHeight(): number {
    return this.$vuetify.breakpoint.smAndDown ? 56 : 64;
  }

  public get containerCssHeight(): string {
    return `height: calc(100vh - ${this.toolbarHeight + this.headerHeight}px`;
  }

  public get containerStyle(): string {
    return `${this.containerCssHeight}; overflow: auto;`;
  }

  public get dropContainerStyle(): string {
    const color = this.$vuetify.theme.currentTheme.accent;
    return `position: sticky; top: 0; ${this.containerCssHeight}; border: 3px solid ${color};`;
  }

  public get textareaRows(): number {
    const rows = this.draft.split('\n').length;
    return rows >= 1 && rows <= 3 ? rows : rows > 3 ? 3 : 1;
  }

  public isReadOrSent(status: MessageStatus): boolean {
    return status === 'sent' || status === 'read';
  }
  public isRejectedOrPending(status: MessageStatus): boolean {
    return status === 'pending' || status === 'rejected';
  }

  public isPending(status: MessageStatus): boolean {
    return status === 'pending';
  }

  public isRejected(status: MessageStatus): boolean {
    return status === 'rejected';
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

.drop-animation {
  animation: drop-animation 2s infinite;
}

.move-animation {
  animation: move-animation 2s infinite;
}

@keyframes move-animation {
  0% {
    transform: translate(-15px, 0) skewY(25deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(15px, 0) skewY(-25deg);
    opacity: 0;
  }
}

.drop-animation {
  animation: drop-animation 2s infinite;
}

@keyframes drop-animation {
  0% {
    opacity: 0;
    transform: translate(0, 1rem);
  }
  50% {
    opacity: 1;
    transform: translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, 1rem);
  }
}
</style>
