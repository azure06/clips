<template>
  <v-card
    class="mx-auto"
    :max-width="isGridMode ? 900 : undefined"
    flat
    color="transparent"
  >
    <v-card
      v-if="isGridMode"
      :class="`${$vuetify.breakpoint.smAndDown ? 'ma-4' : `ma-8`} slide-move`"
      color="surfaceVariant"
    >
      <v-card-text>
        <div>Labels</div>
        <v-row class="pa-2">
          <v-col
            v-for="label in labels"
            :key="`${label.id}-ls`"
            class="d-flex child-flex pa-1"
            cols="auto"
          >
            <v-chip
              @click="$emit('label-click', label)"
              label
              dark
              :color="label.color"
            >
              <v-icon left small>
                mdi-label
              </v-icon>
              <div class="caption font-weight-bold text-uppercase">
                {{ label.name }}
              </div>
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn rounded icon @click="labelDialog = true">
          <v-icon small>mdi-tag-plus</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-row justify="center">
      <v-dialog v-model="labelDialog" max-width="300">
        <v-card>
          <v-card-title class="subtitle-1">
            Edit labels
          </v-card-title>
          <!-- Add -->
          <v-card-text class="px-2 py-1">
            <v-row
              class="mx-auto d-flex align-center"
              style="max-height: 42px;"
            >
              <v-btn rounded small icon>
                <v-icon v-if="editNewLabel" small @click="editNewLabel = false">
                  mdi-close
                </v-icon>
                <v-icon v-else small @click="editNewLabel = true">
                  mdi-plus
                </v-icon>
              </v-btn>
              <v-text-field
                v-model="newLabel"
                dense
                class="caption font-weight-bold"
                placeholder="CREATE NEW LABEL"
                solo
                flat
                @focus="editNewLabel = true"
              ></v-text-field>
              <v-btn v-if="editNewLabel" rounded small icon>
                <v-icon small @click="finishEditingNewLabel">
                  mdi-check
                </v-icon>
              </v-btn>
            </v-row>
            <v-virtual-scroll
              :items="labels.filter((label) => label.id !== 'starred')"
              style="overflow-x: hidden"
              height="140"
              item-height="36"
            >
              <template v-slot:default="{ item }">
                <!-- Edit -->
                <v-row
                  class="mx-auto  d-flex align-center"
                  style="max-height: 36px"
                >
                  <v-btn rounded small icon>
                    <v-icon small :color="item.color">
                      mdi-label
                    </v-icon>
                  </v-btn>
                  <v-text-field
                    :value="item.name"
                    @input="
                      (value) => $emit(`edit-label`, { ...item, name: value })
                    "
                    dense
                    class="caption font-weight-bold"
                    placeholder="EDIT LABEL"
                    solo
                    flat
                  ></v-text-field>
                  <v-btn
                    rounded
                    small
                    icon
                    @click="$emit(`remove-label`, item.id)"
                  >
                    <v-icon small>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-virtual-scroll>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="labelDialog = false">
              Done
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Seprator -->
    <v-card
      :class="
        isGridMode
          ? `${
              $vuetify.breakpoint.smAndDown ? 'ma-4' : `ma-8`
            } slide-move delay`
          : ''
      "
      :flat="!isGridMode"
      color="surfaceVariant"
    >
      <v-card-text :class="!isGridMode ? 'ma-0 pa-0' : ''">
        <div v-if="isGridMode">Clips</div>
        <v-list two-line dense nav color="surfaceVariant" class="pt-1">
          <v-list-item
            v-for="(clip, index) in clipsObserver"
            :key="clip.id"
            @mouseover="$emit('clip-hover', index)"
            @click="$emit('clip-click', index, clip.displayingFormat)"
          >
            <v-list-item-content>
              <v-list-item-title
                v-if="clip.displayingFormat === 'plainText'"
                v-text="clip.preview"
              ></v-list-item-title>
              <v-img
                v-else-if="clip.displayingFormat === 'dataURI'"
                style="border-radius: 5px; max-height: 64px;"
                :src="clip.dataURI"
                :alt="clip.preview"
              ></v-img>
              <v-list-item-title
                v-else-if="clip.displayingFormat === 'htmlText'"
              >
                <div
                  v-dompurify-html="clip.htmlText"
                  style="border-radius: 5px; max-height: 64px;"
                ></div>
              </v-list-item-title>
              <v-list-item-title
                v-else-if="clip.displayingFormat === 'richText'"
                v-text="clip.richText"
              >
              </v-list-item-title>
              <v-list-item-subtitle
                v-text="clip.fromNow"
              ></v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action
              class="pa-0 pl-2 ma-0"
              v-if="clipboardMode !== 'select'"
            >
              <div>
                <!-- This is not required anymore -->
                <v-menu
                  v-if="false && clip.formats.length > 1"
                  offset-x
                  max-height="170"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-format-letter-case</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense width="190">
                    <v-list-item-group
                      :value="indexSelectedFormat(clip)"
                      color="primary"
                    >
                      <v-list-item
                        v-for="(format, formatIndex) in clip.formats"
                        :key="`${format}-${formatIndex}-format`"
                        @click="
                          $emit('change-format', {
                            [clip.id]: toClipProp(format),
                          })
                        "
                        dense
                      >
                        <v-list-item-icon class="mx-0">
                          <v-icon v-text="`mdi-label`" small></v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="mx-2">{{
                          translationByFormat[format]
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-menu>
                <!-- Not required until here -->

                <!-- Edit Image -->
                <v-btn
                  v-if="isImage[clip.type]"
                  icon
                  @click.stop="$emit('edit-image', clip)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <!-- Star -->
                <v-menu offset-x max-height="170">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon :color="colorByLabelId[clip.category]"
                        >mdi-star</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list dense width="190">
                    <v-list-item-group
                      :value="indexSelectedLabel(clip)"
                      color="primary"
                    >
                      <v-list-item
                        v-for="(label, labelIndex) in labelsWithNone"
                        :key="`${label.id}-${labelIndex}-menu`"
                        @click="$emit('label-select', label, index)"
                        dense
                      >
                        <v-list-item-icon class="mx-0">
                          <v-icon
                            v-text="`mdi-label`"
                            small
                            :color="label.color"
                            v-if="labelIndex !== 0"
                          ></v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="mx-2">{{
                          label.name
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-menu>
              </div>
            </v-list-item-action>
            <v-list-item-action class="pa-0 pl-2 pr-2 ma-0" v-else>
              <v-checkbox
                :input-value="removeTarget[clip.id]"
                color="cyan darken-2"
                @click="$emit('remove-click', $event, index)"
              ></v-checkbox>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <!-- Loading circle -->

        <transition name="fade">
          <div style="height: 120px" class="py-4" flat tile>
            <v-row v-if="loading" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="cyan darken-2"
                size="50"
              ></v-progress-circular>
            </v-row>
            <v-row
              v-if="loading"
              align="center"
              justify="center"
              class="text-center"
            >
              <v-subheader class="text-center overline"
                >Loading more data...</v-subheader
              >
            </v-row>
          </div>
        </transition>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script lang="ts">
// @ is an alias to /src
import { Clip, Label } from '@/store/types';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { uuid } from 'uuidv4';
import { randomColor } from '@/store/network/actions';
import { Translation } from '@/utils/translations/types';
import { ClipExtended, ClipFormat, toClipProp } from '@/views/Home.vue';
import { Format } from '@/rxdb/clips/model';

@Component
export default class Grid extends Vue {
  @Prop({ required: true })
  public translations!: Translation;
  @Prop({ required: true })
  public clipsObserver!: Array<Clip & { fromNow?: string; preview?: string }>;
  @Prop()
  public loading?: boolean;
  @Prop({ required: true })
  public clipboardMode?: 'normal' | 'select';
  @Prop({ required: true })
  public removeTarget!: { [id: string]: boolean };
  @Prop({ required: true })
  public labels!: Label[];

  @Prop({ required: true })
  public viewMode!: 'list' | 'grid';

  // TODO Consider to move the state in Home.vue
  public labelDialog = false;
  public editNewLabel = false;
  public newLabel = '';

  public get colorByLabelId(): { [labelId: string]: string | undefined } {
    return this.labels.reduce(
      (acc, label) => ({
        ...acc,
        ...{ [label.id]: label.color },
      }),
      {}
    );
  }

  public get isImage(): { text: false; image: true } {
    return {
      text: false,
      image: true,
    };
  }

  public get translationByFormat(): { [P in Format]: string } {
    return {
      'text/plain': this.translations.text,
      'text/html': this.translations.htmlText,
      'text/rtf': this.translations.richText,
      'image/png': this.translations.image,
      'image/jpg': this.translations.image,
      'vscode-editor-data': 'EMPTY',
    };
  }

  public finishEditingNewLabel(): void {
    if (this.newLabel === '') return;
    this.$emit('create-label', {
      id: uuid(),
      name: this.newLabel,
      color: randomColor(),
    } as Label);
    this.newLabel = '';
    this.editNewLabel = false;
  }

  public get isGridMode(): boolean {
    return this.viewMode === 'grid';
  }

  public get labelsWithNone(): Label[] {
    return [{ name: 'None', color: '#1d1d20', id: '' }, ...this.labels];
  }

  public toClipProp(format: Format): ClipFormat {
    return toClipProp(format);
  }

  public indexSelectedFormat(clip: ClipExtended): number {
    const value = clip.formats.findIndex(
      (format) => toClipProp(format) === clip.displayingFormat
    );
    return value === -1 ? 0 : value;
  }

  public indexSelectedLabel(clip: Clip): number {
    const value = this.labelsWithNone.findIndex(
      (label) => label.id === clip.category
    );
    return value === -1 ? 0 : value;
  }
}
</script>

<style scoped>
/* lang="scss" doesnt work */
.v-text-field >>> .v-text-field__details {
  display: none;
}
.v-input--dense > .v-input__control > .v-input__slot {
  margin-bottom: 0px;
}

.slide-move {
  animation: move 1s cubic-bezier(0.19, 1, 0.22, 1);
}
.slide-move.delay {
  animation: move 1.7s cubic-bezier(0.19, 1, 0.22, 1);
}

@keyframes move {
  0% {
    opacity: 0;
    top: 500px;
  }
  100% {
    opacity: 1;
    top: 0;
  }
}
</style>
