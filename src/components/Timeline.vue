<template>
  <div>
    <chat-bubble
      v-for="message in items"
      v-bind:key="message.timestamp"
      v-bind:text="message.text"
      v-bind:sender="message.sender.toUpperCase()"
      v-bind:time="getTime(message.timestamp)"
    />
  </div>
</template>

<script>
import ChatBubble from './ChatBubble.vue';

export default {
  components: {
    'chat-bubble': ChatBubble,
  },
  props: ['items'],
  methods: {
    getTime: timestamp => {
      const date = new Date(timestamp);
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    },
  },
};
</script>
