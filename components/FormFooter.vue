<template>
  <div class="flex justify-between">
    <UButton
      v-if="showPrev"
      color="gray"
      variant="soft"
      @click="$emit('prev')"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2" />
      上一步
    </UButton>
    <div v-else />
    
    <div class="flex gap-3">
      <UButton
        color="gray"
        variant="outline"
        @click="$emit('cancel')"
      >
        取消
      </UButton>
      <UButton
        v-if="showNext"
        :color="color"
        @click="$emit('next')"
        :disabled="nextDisabled"
      >
        下一步
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
      <UButton
        v-else
        color="green"
        @click="$emit('save')"
        :loading="loading"
      >
        <UIcon name="i-heroicons-check" class="mr-2" />
        {{ loading ? '儲存中...' : '儲存' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ButtonColor } from '#ui/types'

defineProps<{
  showPrev?: boolean
  showNext?: boolean
  color?: ButtonColor
  loading?: boolean
  nextDisabled?: boolean
}>()

defineEmits<{
  prev: []
  next: []
  cancel: []
  save: []
}>()
</script>
