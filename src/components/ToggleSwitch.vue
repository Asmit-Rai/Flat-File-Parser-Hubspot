<template>
  <div class="toggle-row">
    <label class="toggle-label">{{ label }}</label>
    <button
      class="toggle-button"
      :class="{ active: modelValue }"
      @click="$emit('update:modelValue', !modelValue)"
      type="button"
    >
      <span class="toggle-option" :class="{ selected: !modelValue }">No</span>
      <span class="toggle-option" :class="{ selected: modelValue }">Yes</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>