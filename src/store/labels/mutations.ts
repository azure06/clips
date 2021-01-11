import { MutationTree } from 'vuex';
import { Label, LabelState } from '@/store/types';
import { defaultLabel } from '.';

const updateLabels = (func: (args: Label[]) => Label[]) => {
  try {
    const labels: Label[] = JSON.parse(localStorage.getItem('labels') || '[]');
    const labels_ = func(labels);
    localStorage.setItem('labels', JSON.stringify(labels_));
    return [defaultLabel, ...labels_];
  } catch (e) {
    localStorage.setItem('labels', JSON.stringify([]));
    return func([defaultLabel]);
  }
};

const mutations: MutationTree<LabelState> = {
  addLabel(state, label: Label) {
    state.labels = updateLabels((labels) =>
      labels.find((label_) => label_.name === label.name)
        ? labels
        : [
            ...labels,
            { ...label, createdAt: Date.now(), updatedAt: Date.now() },
          ]
    );
  },
  modifyLabel(state, label: Label) {
    state.labels = updateLabels((labels) =>
      labels.find((label_) => label_.name === label.name)
        ? labels
        : labels.map((label_) =>
            label_.id === label.id ? { ...label, updateAt: Date.now() } : label_
          )
    );
  },
  removeLabel(state, labelId: string) {
    state.labels = updateLabels((labels) =>
      labels.filter((label) => label.id !== labelId)
    );
  },
};

export default mutations;
