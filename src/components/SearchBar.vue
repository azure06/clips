<template>
  <v-toolbar bottom>
    <v-toolbar-items :class="`toolbar ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`">
      <v-text-field
        :value="searchQuery"
        @input="(value) => $emit('query-change', value)"
        class="pa-2"
        label="Search..."
        prepend-inner-icon="mdi-magnify"
        autofocus
        clearable
        dense
        flat
        solo
        filled
      ></v-text-field>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <template>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            @click="$emit('change-type', !type ? 'text' : type === 'text' ? 'image' : undefined)"
          >
            <v-icon v-if="!type">mdi-collage</v-icon>
            <v-icon v-if="type === 'text'">mdi-clipboard-text</v-icon>
            <v-icon v-if="type === 'image'">mdi-panorama</v-icon>
          </v-btn>
        </template>
        <span>{{ !type ? 'All Types' : type === 'text' ? 'Only Text' : 'Only Images' }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
            :color="category === 'starred' ? 'blue darken-2' : undefined"
            @click="$emit('change-category', category !== 'starred' ? 'starred' : undefined)"
          >
            <v-icon>mdi-star</v-icon>
          </v-btn>
        </template>
        <span>{{ category === 'starred' ? 'Only Starred' : 'All Categories' }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-show="mode !== 'select'" icon @click="$emit('change-mode', 'select')" v-on="on">
            <v-icon>mdi-delete-circle</v-icon>
          </v-btn>
        </template>
        <span>Remove</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn
            v-show="mode === 'select'"
            v-on="on"
            icon
            @click="$emit('remove-items')"
            color="cyan darken-2"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </template>
        <span>Confirm</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn
            v-show="mode === 'select'"
            v-on="on"
            icon
            @click="$emit('change-mode', 'normal')"
            color="red"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Cancel</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="$emit('change-mode', 'normal')">
            <v-icon
              v-if="syncStatus !== 'rejected'"
              :class="syncStatus === 'pending' ? 'infinite-spinning' : ''"
              >mdi-sync</v-icon
            >
            <v-icon color="amber darken-1" v-else>mdi-sync-alert</v-icon>
          </v-btn>
        </template>
        <span>Sync with Drive</span>
      </v-tooltip>

      <v-menu
        transition="slide-y-transition"
        bottom
        :close-on-click="true"
        :close-on-content-click="true"
        nudge-width="150"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item link @click="$emit('upload-json')">
            <v-list-item-avatar class="pa-0 ma-0">
              <v-icon v-text="`mdi-upload`" dense></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Upload Items</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="$emit('download-json')">
            <v-list-item-avatar class="pa-0 ma-0">
              <v-icon v-text="`mdi-download`" dense></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Download Items</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link :to="{ name: 'about' }">
            <v-list-item-avatar class="pa-0 ma-0">
              <v-icon v-text="`mdi-information`" dense></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title> About Clips</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-toolbar>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';

@Component
export default class SearchBar extends Vue {
  @Prop({ default: 'normal' })
  public mode!: 'normal' | 'select';
  @Prop()
  public type?: 'text' | 'image';
  @Prop()
  public category?: 'none' | 'starred';
  @Prop()
  public searchQuery!: 'string';
  @Prop()
  public syncStatus?: 'pending' | 'resolved' | 'rejected';
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

.infinite-spinning {
  animation: infinite-spinning 2s infinite;
}

@keyframes infinite-spinning {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}
</style>
