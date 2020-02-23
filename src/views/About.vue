<template>
  <v-card class="mx-auto pt-10" tile height="100%">
    <v-img src="./../assets/icons/clip.png" contain height="150"></v-img>
    <div class="text-center pt-10">
      <span class="title text-center font-weight-bold">Clips</span>
    </div>
    <v-card-text class="subtitle-2 text-center">
      <div class="text-center">
        Version: 0.1.0
      </div>
      <div class="text-center">Commit: {{ rootState.commit }}</div>

      <div class="text-center">Date: {{ moment(rootState.date).format('MMMM DD, YYYY') }}</div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import moment from 'moment';
import { Action, Getter } from 'vuex-class';

@Component
export default class About extends Vue {
  @Getter('rootState')
  public rootState!: any;

  public get moment() {
    return moment;
  }
}
</script>
