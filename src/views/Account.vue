<template>
  <v-container fluid class="fill-height">
    <v-card v-if="!user" class="mx-auto" min-width="460">
      <v-row>
        <v-col cols="12">
          <v-row align="center" justify="center" class="pa-3">
            <v-avatar color="#CEF2EF" width="90" height="90">
              <span class="headline " style="color: #1B9488;">F</span>
            </v-avatar>
          </v-row>

          <v-row align="center" justify="center">
            <v-card-title class="pa-0 ma-0">
              <div class="subtitle-1 font-weight-bold">Sign-in with Google</div>
            </v-card-title>
          </v-row>

          <v-row align="center" justify="center">
            <v-card-subtitle class="pa-0 ma-0">
              <div>Allow syncing with multiple computers</div>
            </v-card-subtitle>
          </v-row>

          <v-row align="center" justify="center" class="ma-2">
            <v-btn text large tile @click="signIn">
              Sign-in
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
    <v-card v-if="!!user" class="mx-auto" min-width="460">
      <v-row>
        <v-col cols="12">
          <v-row align="center" justify="center" class="pa-3">
            <v-avatar color="#CEF2EF" width="90" height="90">
              <img :src="user.photoLink" />
            </v-avatar>
          </v-row>

          <v-row align="center" justify="center">
            <v-card-title class="pa-0 ma-0">
              <div class="subtitle-1 font-weight-bold">{{ user.displayName }}</div>
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
              Sign-out
            </v-btn>
          </v-row>

          <v-divider></v-divider>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import Observable, { fromEvent, Subject, merge } from 'rxjs';
import { Clip, User } from '@/store/types';
import { Getter, Mutation, Action } from 'vuex-class';
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';

@Component
export default class Account extends Vue {
  @Action('signIn', { namespace: 'user' })
  public signIn!: () => Promise<void>;
  @Action('signOut', { namespace: 'user' })
  public signOut!: () => Promise<void>;
  @Getter('user', { namespace: 'user' })
  public user!: () => Promise<User>;
  public value = false;
}
</script>

<style scoped lang="scss"></style>
