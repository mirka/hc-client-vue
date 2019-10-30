<template>
  <div>
    <timeline-bubble
      v-for="item in items"
      v-bind:key="item.eventType + item.timestamp"
      v-bind:text="item.text"
      v-bind:sender="item.sender.toUpperCase()"
      v-bind:time="getTime(item.timestamp)"
    />
  </div>
</template>

<script>
import TimelineBubble from './TimelineBubble.vue';

export default {
  components: {
    'timeline-bubble': TimelineBubble,
  },
  props: ['items'],
  methods: {
    getTime: timestamp => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
  },
};
</script>
