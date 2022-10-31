<template>
  <v-card class="mx-auto fill-height">
    <div id="editor"></div>
  </v-card>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Quill from 'quill';
import { Component } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import { ExtendedVue } from '@/renderer/utils/basevue';

@Component<Note>({
  components: {},
  subscriptions() {
    return {};
  },
})
export default class Note extends ExtendedVue {
  mounted(): void {
    var quill = new Quill('#editor', {
      debug: 'info',
      modules: {
        toolbar: [
          [{ font: [] }, { size: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'super' }, { script: 'sub' }],
          [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['direction', { align: [] }],
          ['link', 'image', 'video', 'formula'],
          ['clean'],
        ],
      },
      placeholder: 'Compose an epic...',
      readOnly: true,
      theme: 'snow',
    });
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/css/snow.css';
</style>
