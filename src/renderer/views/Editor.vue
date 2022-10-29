/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <div class="imageEditorApp">
    <AppBarSmall
      :translations="$translations"
      :title="clip ? clip.plainText : undefined"
    />
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          fab
          top
          right
          absolute
          class="v-btn--example"
          style="top: 45px; right: 25px"
          @click="copy"
        >
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <span>Copy</span>
    </v-tooltip>
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          fab
          top
          right
          absolute
          class="v-btn--example"
          style="top: 115px; right: 25px"
          @click="download"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </template>
      <span>Download</span>
    </v-tooltip>
    <tui-image-editor
      :class="$vuetify.theme.dark ? '' : 'light'"
      ref="tuiImageEditor"
      :include-ui="true"
      :options="options"
      @addText="onAddText"
      @objectMoved="onObjectMoved"
    />
  </div>
</template>

<script lang="ts">
import AppBarSmall from '@/renderer/components/AppBarSmall.vue';
import { Component } from 'vue-property-decorator';
import { ExtendedVue } from '@/renderer/utils/basevue';
import 'tui-image-editor/dist/svg/icon-a.svg';
import 'tui-image-editor/dist/svg/icon-b.svg';
import 'tui-image-editor/dist/svg/icon-c.svg';
import 'tui-image-editor/dist/svg/icon-d.svg';

// Load Style Code
import 'tui-image-editor/dist/tui-image-editor.css';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ImageEditor } from '@toast-ui/vue-image-editor';
import { getClipId } from '@/utils/environment';
import { Action, Getter } from 'vuex-class';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { Clip } from '@/renderer/store/types';
import { Data } from '@/electron/services/clipboard';
import { loadImage } from '@/utils/common';

@Component<Editor>({
  components: {
    'tui-image-editor': ImageEditor,
    AppBarSmall,
  },
  subscriptions() {
    return {} as const;
  },
})
export default class Editor extends ExtendedVue {
  @Getter('premium', { namespace: 'configuration' })
  public premium!: boolean;
  @Action('findClips', { namespace: 'clips' })
  public findClips!: (condition: Partial<ClipSearchConditions>) => Clip[];
  @Action('copyToClipboard', { namespace: 'clips' })
  public copyToClipboard!: (data: Data) => Promise<void>;

  public clip: Clip | null = null;

  public options = {
    includeUI: {
      initMenu: 'filter',
      usageStatistics: false,
      theme: this.$vuetify.theme.dark ? undefined : whiteTheme,
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onAddText(pos: unknown): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onObjectMoved(props: unknown): void {}

  public async mounted(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.clip = (
      await this.findClips({
        filters: { id: getClipId(window.process.argv) },
      })
    )[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = this.$refs.tuiImageEditor as any;

    editor
      .invoke('loadImageFromURL', this.clip?.dataURI, 'My sample image')
      .then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (result: {
          newHeight: number;
          newWidth: number;
          oldHeight: number;
          oldWidth: number;
        }) => {
          editor.invoke('ui.activeMenuEvent');
        }
      );

    let scale = 1;
    const el = this.$el.querySelector<HTMLElement>('.tui-image-editor');
    if (el) {
      el.onwheel = function (ev: WheelEvent) {
        ev.preventDefault();
        scale += ev.deltaY * -0.001;
        scale = Math.min(Math.max(0.125, scale), 4);
        // Apply scale transform
        el.style.transform = `scale(${scale})`;
      };
    }
  }

  public async embedWatermark(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = this.$el.querySelector('.lower-canvas') as any;
    if (!this.premium) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const image = await loadImage(
        require('./../../assets/icons/watermark.png')
      );
      const targetWidth = Math.floor(canvas.width / 5);
      canvas
        .getContext('2d')
        .drawImage(
          image,
          canvas.width - targetWidth,
          canvas.height - Math.floor(targetWidth / 2),
          targetWidth,
          Math.floor(targetWidth / 2)
        );
    }
    return canvas.toDataURL();
  }

  public async copy(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.copyToClipboard({
      // text: this.clip?.plainText,
      // html: this.clip?.htmlText,
      image: await this.embedWatermark(),
      // rtf: this.clip?.richText,
    });
  }

  public async download(): Promise<void> {
    const url = await this.embedWatermark();
    const a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('href', url);
    a.setAttribute('download', this.clip?.plainText || 'Untitled');
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}

const whiteTheme = {
  'common.bi.image':
    'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
  'common.bisize.width': '251px',
  'common.bisize.height': '21px',
  'common.backgroundImage': './img/bg.png',
  'common.backgroundColor': '#fff',
  'common.border': '1px solid #c1c1c1',

  // header
  'header.backgroundImage': 'none',
  'header.backgroundColor': 'transparent',
  'header.border': '0px',

  // load button
  'loadButton.backgroundColor': '#fff',
  'loadButton.border': '1px solid #ddd',
  'loadButton.color': '#222',
  'loadButton.fontFamily': "'Noto Sans', sans-serif",
  'loadButton.fontSize': '12px',

  // download button
  'downloadButton.backgroundColor': '#fdba3b',
  'downloadButton.border': '1px solid #fdba3b',
  'downloadButton.color': '#fff',
  'downloadButton.fontFamily': "'Noto Sans', sans-serif",
  'downloadButton.fontSize': '12px',

  // main icons
  'menu.normalIcon.color': '#8a8a8a',
  'menu.activeIcon.color': '#555555',
  'menu.disabledIcon.color': '#434343',
  'menu.hoverIcon.color': '#e9e9e9',
  'menu.iconSize.width': '24px',
  'menu.iconSize.height': '24px',

  // submenu icons
  'submenu.normalIcon.color': '#8a8a8a',
  'submenu.activeIcon.color': '#555555',
  'submenu.iconSize.width': '32px',
  'submenu.iconSize.height': '32px',

  // submenu primary color
  'submenu.backgroundColor': 'white',
  'submenu.partition.color': '#e5e5e5',

  // submenu labels
  'submenu.normalLabel.color': '#858585',
  'submenu.normalLabel.fontWeight': 'normal',
  'submenu.activeLabel.color': '#000',
  'submenu.activeLabel.fontWeight': 'normal',

  // checkbox style
  'checkbox.border': '1px solid #ccc',
  'checkbox.backgroundColor': '#fff',

  // rango style
  'range.pointer.color': '#333',
  'range.bar.color': '#ccc',
  'range.subbar.color': '#606060',

  'range.disabledPointer.color': '#d3d3d3',
  'range.disabledBar.color': 'rgba(85,85,85,0.06)',
  'range.disabledSubbar.color': 'rgba(51,51,51,0.2)',

  'range.value.color': '#000',
  'range.value.fontWeight': 'normal',
  'range.value.fontSize': '11px',
  'range.value.border': '0',
  'range.value.backgroundColor': '#f5f5f5',
  'range.title.color': '#000',
  'range.title.fontWeight': 'lighter',

  // colorpicker style
  'colorpicker.button.border': '0px',
  'colorpicker.title.color': '#000',
};
</script>

<style lang="scss">
.imageEditorApp {
  width: 100%;
  height: calc(100% - 30px);
}
.tui-image-editor-header {
  display: none;
}
.tui-image-editor-main {
  top: 0 !important;
}
.v-btn--example {
  z-index: 100;
  margin: 0 0 0 0;
}

.tui-colorpicker-clearfix {
  display: flex;
  flex-wrap: wrap;
}
.tui-colorpicker-palette-button {
  width: 15px;
  height: 15px;
}
.light .tui-image-editor-menu {
  background-color: white;
}
</style>
