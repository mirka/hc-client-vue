<template>
  <div style="padding-bottom: 8px;">
    <v-card outlined>
      <v-card-text class="text--primary">
        <span style="color: gray; margin-right: 1em;">
          {{ time }} • {{ sender }}
        </span>
        {{ text }}
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ['text', 'sender', 'time'],
};
</script>
