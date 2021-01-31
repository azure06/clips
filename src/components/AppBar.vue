<template>
  <div style="-webkit-app-region: drag">
    <v-toolbar flat color="surfaceVariant" dense>
      <v-toolbar-title
        class="subtitle-2 font-weight-medium text-uppercase"
        style="user-select: none;"
        >{{ translations.clipboard }}
        <v-subheader
          v-if="time"
          class="text-capitalize font-weight-bold pa-0 pt-1 pb-1 ma-0"
          style="height: 12px; font-size: 10px;"
          inset
          >{{ moment(time).format('MMMM DD, YYYY') }}</v-subheader
        >
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div
        v-if="!isWindows && count !== undefined"
        style="display: flex; align-items: baseline; user-select: none;"
      >
        <div class="subtitle-2 pa-1 font-weight-bold">{{ count }}</div>
        <div class="caption pa-1 font-weight-regular">
          {{ translations.items }}
        </div>
      </div>
      <div
        v-if="isWindows"
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
    </v-toolbar>
    <v-divider class="inset"></v-divider>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import moment from 'moment';
import { remote } from 'electron';
import { isWindows } from '@/utils/environment';

@Component
export default class AppBar extends Vue {
  @Prop()
  public time?: number;
  @Prop({ required: true })
  public translations!: unknown;
  @Prop()
  public count?: number;

  public get moment(): typeof moment {
    return moment;
  }

  public get remote(): typeof remote {
    return remote;
  }

  public get isWindows(): boolean {
    return isWindows;
  }

  minimize(): void {
    remote.getCurrentWindow().minimize();
  }

  unmaximize(): void {
    remote.getCurrentWindow().unmaximize();
  }

  maximize(): void {
    remote.getCurrentWindow().maximize();
  }

  close(): void {
    remote.getCurrentWindow().close();
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  width: 100%;
  margin-top: 8px;
}
.toolbar.small {
  margin-top: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

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
