<template>
  <v-app>
    <v-content>
      <div class="wrapper">
        <div style="flex: 1 0 auto;">
          <timeline v-bind:items="timeline" />
        </div>
        <div>
          <chat-input
            @emit-typing-event="emitCustomerTyping"
            @send-message="sendMessage"
            v-bind:operatorIsTyping="operatorIsTyping"
          />
        </div>
      </div>
      <error-snackbar />
    </v-content>
  </v-app>
</template>

<script>
import ChatInput from './components/ChatInput.vue';
import ErrorSnackbar from './components/ErrorSnackbar';
import Timeline from './components/Timeline.vue';
import { state } from './store';
import boot from './boot';

const { emitCustomerTyping, sendMessage } = boot();

export default {
  name: 'App',
  data: () => state,
  components: {
    timeline: Timeline,
    'chat-input': ChatInput,
    'error-snackbar': ErrorSnackbar,
  },
  methods: {
    emitCustomerTyping,
    sendMessage,
  },
};
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}
</style>
