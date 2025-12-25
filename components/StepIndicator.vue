<template>
  <div class="mb-8">
    <div class="flex items-center justify-center space-x-4">
      <div v-for="(step, idx) in steps" :key="idx" class="flex items-center">
        <div class="flex items-center">
          <div 
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
              currentStep >= idx ? `bg-${color}-600 text-white` : 'bg-gray-200 text-gray-500'
            ]"
          >
            {{ idx + 1 }}
          </div>
          <span 
            :class="[
              'ml-2 font-medium',
              currentStep >= idx ? `text-${color}-600` : 'text-gray-400'
            ]"
          >
            {{ step }}
          </span>
        </div>
        <div 
          v-if="idx < steps.length - 1" 
          class="w-16 h-1 mx-4" 
          :class="currentStep > idx ? `bg-${color}-600` : 'bg-gray-200'"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: string[]
  currentStep: number
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink'
}>()
</script>
