<template>
  <v-app>
    <NavDrawer :style="dragActive ? '-webkit-app-region: drag' : ''" />
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
export default class App extends Vue {
  get dragActive() {
    switch (this.$route.name) {
      case 'general-settings':
        return false;
      case 'advanced-settings':
        return false;
      case 'language-settings':
        return false;
      default:
        return true;
    }
  }
}
</script>

<style scoped lang="scss"></style>
