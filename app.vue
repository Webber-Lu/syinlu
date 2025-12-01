<template>
  <NuxtPage />
</template>

<script setup lang="ts">
// 強制使用明亮模式
const colorMode = useColorMode()
colorMode.preference = 'light'
</script>