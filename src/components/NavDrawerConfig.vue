<template>
  <!--  Drawer -->
  <!-- Class py-2 for Mac -->
  <v-navigation-drawer
    app
    mini-variant
    permanent
    floating
    color="surfaceVariant"
  >
    <v-list dense nav :class="isMacOS ? 'mt-8' : ''">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-on="on"
            class="px-3"
            link
            color="primary"
            :to="{ name: 'general-settings' }"
            style="-webkit-app-region: no-drag"
          >
            <v-list-item-icon>
              <v-icon>mdi-console-line</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.general }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-on="on"
            class="px-3"
            link
            color="primary"
            :to="{ name: 'advanced-settings' }"
            style="-webkit-app-region: no-drag"
          >
            <v-list-item-icon>
              <v-badge v-if="!premium" color="cyan darken-2" overlap>
                <template v-slot:badge>
                  <v-icon x-small dark>mdi-lock</v-icon>
                </template>
                <v-icon>mdi-view-grid-plus</v-icon>
              </v-badge>
              <v-icon v-else>mdi-view-grid-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.advanced }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-on="on"
            class="px-3"
            link
            color="primary"
            style="-webkit-app-region: no-drag"
            :to="{ name: 'language-settings' }"
          >
            <v-list-item-icon>
              <v-icon>mdi-web</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Group</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.language }}</span>
      </v-tooltip>
    </v-list>

    <template v-slot:append>
      <v-list dense nav class="py-0">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="my-1 px-3"
              link
              color="primary"
              :to="{ name: 'home' }"
              style="-webkit-app-region: no-drag"
            >
              <v-list-item-icon>
                <v-icon>mdi-arrow-left-circle</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>title</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.home }}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="my-1 px-3"
              link
              color="primary"
              :to="{ name: 'about' }"
              style="-webkit-app-region: no-drag"
            >
              <v-list-item-icon>
                <v-icon>mdi-information</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>title</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.about }}</span>
        </v-tooltip>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
// @ is an alias to /src
import { ExtendedVue } from '@/utils/basevue';
import { always, whenMacOS } from '@/utils/environment';
import { Component } from 'vue-property-decorator';

@Component
export default class NavDrawerConfig extends ExtendedVue {
  public get isMacOS(): boolean {
    return whenMacOS(always(true), always(false));
  }
}
</script>

<style scoped lang="scss">
$drawer-width: 64px;

.v-navigation-drawer {
  width: $drawer-width !important;
}
</style>
