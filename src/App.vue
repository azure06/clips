<template>
  <v-app>
    <NavDrawer :style="dragActive ? '-webkit-app-region: drag' : ''" />
    <!-- Router View -->
    <v-main
      class="mvleft"
      :style="`background: ${$vuetify.theme.currentTheme.background}`"
    >
      <router-view />
    </v-main>
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

<style scoped lang="scss">
$drawer-width: 64px;
.mvleft {
  padding-left: $drawer-width !important;
}
</style>
