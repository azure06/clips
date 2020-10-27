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
    <!-- Snackbar -->
    <!-- FIXME -1 in version >= 2.3 -->
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card color="surfaceVariant">
        <v-card-title class="subtitle-2">{{ dialogText }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="resolve('close')">
            Close
          </v-btn>
          <v-btn text @click="resolve('once')">
            Once
          </v-btn>
          <v-btn text @click="resolve('always')">
            Always
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import NavDrawer from '@/components/NavDrawer.vue';
import { onAuthorize } from '@/subscriptions';
import { ipcRenderer } from 'electron';
import { Action } from 'vuex-class';
import { IDevice } from 'local-devices';
import { UserDoc } from './rxdb/user/model';
import { UserUpsert } from './store/network/actions';

@Component({ components: { NavDrawer } })
export default class App extends Vue {
  @Action('upsertUser', { namespace: 'network' })
  public upsertUser!: (device: UserUpsert) => Promise<UserDoc>;

  public dialog = false;
  public dialogText = 'Accept the invitation from';
  public resolve: (args: 'close' | 'once' | 'always') => void = () => {};

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

  public created() {
    // Authorize
    this.$subscribeTo(onAuthorize, async (device) => {
      const user = await this.upsertUser({ device });
      if (user.permission === 'always') {
        ipcRenderer.send(`authorize:${user.id}`, true);
      } else if (user.permission === 'once') {
        this.dialogText = `Accept the invitation from ${user.username}`;
        // If pending actions just close the previous dialog
        await this.resolve('close');
        this.dialog = true;
        const result = await new Promise<'close' | 'once' | 'always'>(
          (resolve) => {
            this.resolve = resolve;
          }
        );
        switch (result) {
          case 'close':
            ipcRenderer.send(`authorize:${user.id}`, false);
            break;
          case 'once':
            ipcRenderer.send(`authorize:${user.id}`, true);
            break;
          case 'always':
            ipcRenderer.send(`authorize:${user.id}`, true);
            await this.upsertUser({
              ...user,
              device: { ...user.device, username: user.username },
              permission: 'always',
            });
            break;
        }
      }
      this.dialog = false;
    });
  }
}
</script>

<style scoped lang="scss">
$drawer-width: 64px;
.mvleft {
  padding-left: $drawer-width !important;
}
</style>
