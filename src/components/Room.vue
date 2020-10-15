<template>
  <div>
    <v-container
      class="fill-height ma-0 pa-0 align-start"
      :style="containerStyle"
      fluid
    >
    </v-container>
    <!-- Toolbar -->
    <div class="primary fill-height">
      <v-textarea
        v-model="message"
        class="pa-2 pb-1"
        background-color="background"
        autofocus
        dense
        flat
        solo
        filled
        no-resize
        :rows="textareaRows"
      ></v-textarea>
    </div>
    <v-btn depressed>
      Send
    </v-btn>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { language } from '@/utils/language';
import { SettingsState } from '@/store/types';
import { Room as RoomType } from '@/store/types';

@Component
export default class Room extends Vue {
  @Prop({ required: true })
  public room!: RoomType;
  public message: string = '';

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
    return `height: calc(100vh - ${this.toolbarHeight}px); overflow: auto;`;
  }

  public get textareaRows() {
    const rows = this.message.split('\n').length;
    return rows >= 1 && rows <= 3 ? rows : rows > 3 ? 3 : 1;
  }

  public onChange(event: any) {
    console.log(event);
  }
}
</script>

<style scoped>
/* lang="scss" doesnt work */
.v-textarea >>> .v-text-field__details {
  display: none;
}
</style>
