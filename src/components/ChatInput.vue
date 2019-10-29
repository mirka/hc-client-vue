<template>
  <v-text-field
    autofocus
    outlined
    v-model="message"
    placeholder="Type here"
    append-icon="mdi-send"
    @click:append="sendMessage"
    v-on:keydown.enter="sendMessage"
  />
</template>

<script>
export default {
  data: () => ({
    message: '',
  }),
  methods: {
    sendMessage: function() {
      this.$emit('send-message', this.message);
      this.message = '';
    },
  },
};
</script>
