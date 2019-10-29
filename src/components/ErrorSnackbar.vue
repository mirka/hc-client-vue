<template>
  <v-snackbar :timeout="0" v-model="isErrorVisible">
    {{ error }}
    <v-btn color="red" text @click="clearError">
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
import { state, actions } from '../store';

export default {
  data: () => state,
  computed: {
    isErrorVisible: function() {
      return state.error !== null || false;
    },
  },
  methods: {
    clearError: actions.clearError,
  },
};
</script>
