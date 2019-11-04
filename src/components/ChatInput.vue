<template>
  <div>
    <p v-if="operatorIsTyping">Operator is typing...</p>
    <form autocomplete="off" v-on:submit.prevent="sendMessage">
      <v-text-field
        autofocus
        outlined
        v-model="message"
        placeholder="Type here"
        append-icon="mdi-send"
        @click:append="sendMessage"
        v-on:input="emitCustomerTyping"
      />
    </form>
  </div>
</template>

<script>
import { throttle } from 'lodash';

export default {
  data: () => ({
    message: '',
  }),
  methods: {
    emitCustomerTyping: throttle(
      function() {
        this.$emit('emit-typing-event');
      },
      1000,
      { trailing: false }
    ),
    sendMessage: function() {
      this.$emit('send-message', this.message);
      this.message = '';
    },
  },
  props: ['operatorIsTyping'],
};
</script>
