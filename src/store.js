export const state = {
  error: null,
  operatorIsTyping: false,
  timeline: [],
};

let operatorIsTypingTimer;

export const actions = {
  addToTimeline: event => state.timeline.push(event),
  setOperatorIsTyping: () => {
    window.clearTimeout(operatorIsTypingTimer);

    state.operatorIsTyping = true;

    operatorIsTypingTimer = window.setTimeout(() => {
      state.operatorIsTyping = false;
    }, 1500);
  },
  setError: error => {
    state.error = error;
  },
  clearError: () => {
    state.error = null;
  },
};
