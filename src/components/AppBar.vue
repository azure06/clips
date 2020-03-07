<template>
  <div style="-webkit-app-region: drag">
    <v-toolbar flat>
      <v-toolbar-title class="subtitle-2 font-weight-medium" style="user-select: none;"
        >{{ translations.clipboard }}

        <v-subheader
          class="text-capitalize font-weight-bold pa-0 pt-1 pb-1 ma-0"
          style="height: 12px; font-size: 10px;"
          inset
          >{{ moment(time).format('MMMM DD, YYYY') }}</v-subheader
        >
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div style="display: flex; align-items: baseline; user-select: none;">
        <div class="subtitle-2 pa-1 font-weight-bold">{{ count }}</div>
        <div class="caption pa-1 font-weight-regular">{{ translations.items }}</div>
      </div>
    </v-toolbar>
    <v-divider class="inset"></v-divider>
  </div>
</template>

<script lang="ts">
import { BaseVue } from '@/utils/base-vue';
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class AppBar extends BaseVue {
  @Prop()
  public time!: number;
  @Prop({ required: true })
  public translations!: any;
  @Prop()
  public count?: number;

  public get moment() {
    return moment;
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
</style>
