<template>
  <v-app style="-webkit-app-region: drag">
    <NavDrawer />
    <v-content>
      <!-- Router View -->
      <router-view />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import NavDrawer from '@/components/NavDrawer.vue';

@Component({ components: { NavDrawer } })
export default class App extends Vue {}
</script>

<style scoped lang="scss"></style>
