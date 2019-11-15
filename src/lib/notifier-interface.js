export class Notifier {
  constructor() {
    this.listeners = [];
  }

  notify(value) {
    this.listeners.forEach(listener => {
      listener(value);
    });
  }

  addListener(listener) {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(existing => existing === listener);
  }
}
export class Observable extends Notifier {
  constructor(current) {
    super();
    this.currentValue = current;
  }

  update(change) {
    if (change !== this.currentValue) {
      this.currentValue = change;
      this.notify(this.currentValue);
    }
  }
}
