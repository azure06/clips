<template>
  <v-card class="mx-auto pt-10" tile height="100%" color="surfaceVariant">
    <v-img src="./../assets/icons/clip.png" contain height="150"></v-img>
    <div class="text-center pt-10">
      <span class="title text-center font-weight-bold">Clips</span>
    </div>
    <v-card-text class="subtitle-2 text-center">
      <div class="text-center">Version: {{ rootState.version }}</div>
      <div class="text-center">Commit: {{ rootState.commit }}</div>
      <div class="text-center">Total items: {{ itemsCount }}</div>
      <div class="text-center">
        Date: {{ moment(rootState.date).format('MMMM DD, YYYY') }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

@Component
export default class About extends Vue {
  @Getter('rootState')
  public rootState!: unknown;
  @Action('countClips', { namespace: 'clips' })
  public countClips!: () => Promise<number>;

  public itemsCount = 0;

  public get moment(): typeof moment {
    return moment;
  }

  public async created(): Promise<void> {
    this.itemsCount = await this.countClips();
  }
}
</script>
