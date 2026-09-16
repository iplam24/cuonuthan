<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-xs font-semibold uppercase tracking-editorial text-ink-muted">{{ label }} <span v-if="required" class="text-lacquer" aria-hidden="true">*</span></label>
    <slot :describedby="messageId" :invalid="Boolean(error)" />
    <p v-if="error" :id="messageId" class="text-xs font-medium text-red-700" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="messageId" class="text-xs text-ink-faint">{{ hint }}</p>
  </div>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ id: { type: String, required: true }, label: { type: String, required: true }, error: { type: String, default: '' }, hint: { type: String, default: '' }, required: Boolean });
const messageId = computed(() => props.error || props.hint ? `${props.id}-message` : undefined);
</script>
