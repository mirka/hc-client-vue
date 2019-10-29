export const state = {
  error: null,
  timeline: [],
};

export const actions = {
  addToTimeline: event => state.timeline.push(event),
  setError: error => {
    state.error = error;
  },
  clearError: () => {
    state.error = null;
  },
};
