<template>
  <v-container fluid class="d-flex flex-column fill-height" style="padding: 0">
    <div
      class="d-flex flex-column justify-center"
      style="height: calc(100% - 30px)"
    >
      <v-card
        v-if="!user"
        class="mx-auto"
        :min-width="$vuetify.breakpoint.xsOnly ? 360 : 460"
        color="surfaceVariant"
      >
        <v-row>
          <v-col cols="12">
            <v-row align="center" justify="center" class="pa-3">
              <v-avatar width="90" height="90">
                <v-icon x-large>mdi-account-circle</v-icon>
              </v-avatar>
            </v-row>

            <v-row align="center" justify="center">
              <v-card-title class="pa-0 ma-0">
                <div class="subtitle-1 font-weight-bold">
                  {{ $translations.signInWithGoogle }}
                </div>
              </v-card-title>
            </v-row>

            <v-row align="center" justify="center">
              <v-card-subtitle class="pa-0 ma-0">
                <div>{{ $translations.allowSynWithMultiple }}</div>
              </v-card-subtitle>
            </v-row>

            <v-row align="center" justify="center" class="ma-2">
              <v-btn text large tile @click="signIn">
                {{ $translations.signIn }}
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
      <v-card
        v-if="!!user"
        class="mx-auto"
        :min-width="$vuetify.breakpoint.xsOnly ? 360 : 460"
        color="surfaceVariant"
      >
        <v-row>
          <v-col cols="12">
            <v-row align="center" justify="center" class="pa-3">
              <v-avatar color="#CEF2EF" width="90" height="90">
                <img :src="user.photoLink" />
              </v-avatar>
            </v-row>

            <v-row align="center" justify="center">
              <v-card-title class="pa-0 ma-0">
                <div class="subtitle-1 font-weight-bold">
                  {{ user.displayName }}
                </div>
              </v-card-title>
            </v-row>

            <v-row align="center" justify="center">
              <v-card-subtitle class="pa-0 ma-0">
                <div>{{ user.emailAddress }}</div>
              </v-card-subtitle>
            </v-row>

            <v-divider class="mt-3"></v-divider>

            <v-row align="center" justify="center" class="ma-2">
              <v-btn text large tile @click="signOut">
                {{ $translations.signOut }}
              </v-btn>
            </v-row>

            <v-divider></v-divider>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { User } from '@/store/types';
import { Getter, Action } from 'vuex-class';
import { ExtendedVue } from '@/utils/basevue';
import AppBar from '@/components/AppBar.vue';

@Component({ components: {} })
export default class Account extends ExtendedVue {
  @Action('signIn', { namespace: 'configuration' })
  public signIn!: () => Promise<void>;
  @Action('signOut', { namespace: 'configuration' })
  public signOut!: () => Promise<void>;
  @Getter('user', { namespace: 'configuration' })
  public user!: () => Promise<User>;
  public value = false;
}
</script>

<style scoped lang="scss"></style>
