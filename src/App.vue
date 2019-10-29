<template>
  <v-app>
    <v-content>
      <error-snackbar />
    </v-content>
  </v-app>
</template>

<script>
import ErrorSnackbar from './components/ErrorSnackbar';
import boot from './boot';

boot();

export default {
  name: 'App',
  components: {
    'error-snackbar': ErrorSnackbar,
  },
};
</script>
