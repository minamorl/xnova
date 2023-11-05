import { makeAutoObservable } from 'mobx';

class TextStore {
  text = '';

  constructor() {
    makeAutoObservable(this);
  }

  setText(value: string) {
    this.text = value;
  }
}

export const textStore = new TextStore();
