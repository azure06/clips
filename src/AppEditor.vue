<template>
  <v-app style="overflow-y: hidden;">
    <title>HTML Elements Reference</title>
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
import { Component, Vue } from 'vue-property-decorator';
import NavDrawer from '@/components/NavDrawer.vue';
import { Mutation } from 'vuex-class';
import { Framework } from 'vuetify';

@Component<AppEditor>({
  components: { NavDrawer },
  subscriptions() {
    return {};
  },
})
export default class AppEditor extends Vue {
  @Mutation('loadConfig', { namespace: 'configuration' })
  public loadConfig!: ({ vuetify }: { vuetify: Framework }) => void;

  public created(): void {
    document.title = 'Image Editor';
    // Load Configuration
    this.loadConfig({ vuetify: this.$vuetify });
    this.$router.replace({ name: 'editor' });
  }
}
</script>

<style scoped lang="scss"></style>
