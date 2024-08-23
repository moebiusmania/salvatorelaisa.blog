<script setup lang="ts">
interface Props {
  items: string;
}

const { items = "" } = defineProps<Props>();
const list = items.split(",");
</script>

<template>
  <ul class="timeline">
    <li v-for="(item, index) in list" :key="index">{{ item }}</li>
  </ul>
</template>

<style scoped>
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.timeline li {
  position: relative;
  padding: 1rem;
  border-left: 2px solid #ccc;
  margin: 0;
  transition: all 0.3s ease;
  transform-origin: left;
}

.timeline li:hover {
  color: var(--primary);
  cursor: crosshair;
  transform: scale(1.15);
}

.timeline li:hover:before {
  background-color: var(--primary);
}

.timeline li:before {
  content: "";
  position: absolute;
  left: -6px;
  top: 42%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
}

.timeline li:before {
  border-radius: 50% / 60%;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.2);
  }
}
</style>