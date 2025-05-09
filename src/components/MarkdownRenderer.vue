<template>
  <div class="pa-4" v-html="markdown.render(title)" />
  <div class="pa-4" v-html="markdown.render(summary)" />
  <div class="pa-4" v-html="markdown.render(source)" />
</template>

<script setup lang="ts">
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt();

defineProps({
  source: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "",
  },
});
</script>
