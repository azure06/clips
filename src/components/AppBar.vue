<template>
  <v-app-bar
    app
    style="-webkit-app-region: drag;"
    color="surfaceVariant"
    tile
    height="30px"
    absolute
    flat
    outlined
  >
    <v-toolbar-title
      style="user-select: none;"
      class="font-weight-black blue-grey--text text--darken-3 body-2"
    >
      <!-- <div
        class="d-flex align-center"
        :style="
          `filter: grayscale(0.9) ${
            $vuetify.theme.dark ? 'brightness(1.5)' : ''
          }; opacity: 0.5;`
        "
      >
        <v-img
          src="./../assets/icons/clip.svg"
          contain
          style=""
          width="20"
        ></v-img>
      </div> -->
    </v-toolbar-title>
    <v-spacer />
    <div
      v-if="isWindowsOrLinux"
      :class="`window-controls ${$vuetify.theme.dark ? 'dark' : 'light'}`"
    >
      <div class="button min-button" @click="minimize">
        <img
          class="icon"
          srcset="
            ../assets/win-icons/min-w-10.png 1x,
            ../assets/win-icons/min-w-12.png 1.25x,
            ../assets/win-icons/min-w-15.png 1.5x,
            ../assets/win-icons/min-w-15.png 1.75x,
            ../assets/win-icons/min-w-20.png 2x,
            ../assets/win-icons/min-w-20.png 2.25x,
            ../assets/win-icons/min-w-24.png 2.5x,
            ../assets/win-icons/min-w-30.png 3x,
            ../assets/win-icons/min-w-30.png 3.5x
          "
          draggable="false"
        />
      </div>
      <div
        v-if="!remote.getCurrentWindow().isMaximized()"
        class="button max-button"
        @click="maximize"
      >
        <img
          class="icon"
          srcset="
            ../assets/win-icons/max-w-10.png 1x,
            ../assets/win-icons/max-w-12.png 1.25x,
            ../assets/win-icons/max-w-15.png 1.5x,
            ../assets/win-icons/max-w-15.png 1.75x,
            ../assets/win-icons/max-w-20.png 2x,
            ../assets/win-icons/max-w-20.png 2.25x,
            ../assets/win-icons/max-w-24.png 2.5x,
            ../assets/win-icons/max-w-30.png 3x,
            ../assets/win-icons/max-w-30.png 3.5x
          "
          draggable="false"
        />
      </div>
      <div v-else class="button restore-button" @click="unmaximize">
        <img
          class="icon"
          srcset="
            ../assets/win-icons/restore-w-10.png 1x,
            ../assets/win-icons/restore-w-12.png 1.25x,
            ../assets/win-icons/restore-w-15.png 1.5x,
            ../assets/win-icons/restore-w-15.png 1.75x,
            ../assets/win-icons/restore-w-20.png 2x,
            ../assets/win-icons/restore-w-20.png 2.25x,
            ../assets/win-icons/restore-w-24.png 2.5x,
            ../assets/win-icons/restore-w-30.png 3x,
            ../assets/win-icons/restore-w-30.png 3.5x
          "
          draggable="false"
        />
      </div>
      <div class="button close-button" @click="close">
        <img
          class="icon"
          srcset="
            ../assets/win-icons/close-w-10.png 1x,
            ../assets/win-icons/close-w-12.png 1.25x,
            ../assets/win-icons/close-w-15.png 1.5x,
            ../assets/win-icons/close-w-15.png 1.75x,
            ../assets/win-icons/close-w-20.png 2x,
            ../assets/win-icons/close-w-20.png 2.25x,
            ../assets/win-icons/close-w-24.png 2.5x,
            ../assets/win-icons/close-w-30.png 3x,
            ../assets/win-icons/close-w-30.png 3.5x
          "
          draggable="false"
        />
      </div>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { always, whenLinux, whenWindows } from '@/utils/environment';

@Component
export default class AppBar extends Vue {
  public get remote(): typeof remote {
    return remote;
  }

  public get isWindowsOrLinux(): boolean {
    return (
      whenWindows(always(true), always(false)) ||
      whenLinux(always(true), always(false))
    );
  }

  minimize(): void {
    remote.getCurrentWindow().minimize();
    this.$nextTick(() => this.$forceUpdate());
  }

  unmaximize(): void {
    remote.getCurrentWindow().unmaximize();
    this.$nextTick(() => this.$forceUpdate());
  }

  maximize(): void {
    remote.getCurrentWindow().maximize();
    this.$nextTick(() => this.$forceUpdate());
  }

  close(): void {
    remote.getCurrentWindow().close();
  }
}
</script>

<style scoped lang="scss">
.window-controls {
  -webkit-app-region: no-drag;
  display: grid;
  grid-template-columns: repeat(3, 46px);
  position: absolute;
  top: 0;
  right: 0;
  height: 30px;
  .button {
    user-select: none;
    grid-row: 1 / span 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .icon {
    width: 10px;
    height: 10px;
  }
  &.light {
    .icon {
      filter: invert(1);
    }
    .button:hover {
      background: rgba(0, 0, 0, 0.1);
    }
    .button:active {
      background: rgba(0, 0, 0, 0.2);
    }
    .close-button:hover,
    .close-button:active {
      .icon {
        filter: none;
      }
    }
  }
  &.dark {
    .button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .button:active {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  .min-button {
    grid-column: 1;
  }
  .max-button,
  .restore-button {
    grid-column: 2;
  }
  .close-button {
    grid-column: 3;
  }
  .close-button:hover {
    background: #e81123 !important;
  }
  .close-button:active {
    background: #f1707a !important;
  }
}
</style>
