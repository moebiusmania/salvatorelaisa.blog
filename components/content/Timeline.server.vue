<script setup lang="ts">
interface Props {
  items: string;
}

const { items = "" } = defineProps<Props>();
const list = items.split(",");
</script>

<template>
  <div class="timeline-container">
    <ul class="timeline">
      <li v-for="(item, index) in list" :key="index" class="timeline-item">
        <div class="timeline-content">
          <span class="timeline-text">{{ item.trim() }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.timeline-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--sp-4) var(--sp-2);
}

.timeline {
  --timeline-dot-border: var(--border);

  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: var(--sp-3);
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,
      var(--primary, #3b82f6) 0%,
      var(--primary, #3b82f6) 50%,
      rgba(203, 213, 225, 0.3) 100%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  padding: var(--sp-3) 0 var(--sp-3) var(--sp-8);
  margin: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;
}

.timeline-item:hover {
  opacity: 1;
  transform: translateX(var(--sp-1));
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 19.5px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--primary, #3b82f6), #1d4ed8);
  border: 3px solid var(--timeline-dot-border, #f5f1eb);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.timeline-item:hover::before {
  transform: translateY(-50%) scale(1.3);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, #1d4ed8, var(--primary, #3b82f6));
}

.timeline-content {
  background: var(--timeline-item-bg, #fefcf8);
  border-radius: 12px;
  padding: var(--sp-3) var(--sp-3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary, #3b82f6), #1d4ed8);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .timeline-content {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary, #3b82f6);
}

.timeline-item:hover .timeline-content::before {
  transform: scaleX(1);
}

.timeline-text {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.6;
  letter-spacing: 0.01em;
  transition: color 0.3s ease;
}

.timeline-item:hover .timeline-text {
  color: var(--primary, #3b82f6);
}

/* Responsive design */
@media (max-width: 640px) {
  .timeline-container {
    padding: var(--sp-2) var(--sp-1);
  }

  .timeline::before {
    left: var(--sp-2);
  }

  .timeline-item {
    padding: var(--sp-2) 0 var(--sp-2) var(--sp-6);
  }

  .timeline-item::before {
    left: 11.5px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
  }

  .timeline-content {
    padding: var(--sp-2) var(--sp-2);
    border-radius: var(--sp-1);
  }

  .timeline-text {
    font-size: 0.9rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .timeline-content {
    background: var(--timeline-item-bg, #2d3748);
    border-color: rgba(55, 65, 81, 0.8);
  }

  .timeline-text {
    color: #f9fafb;
  }

  .timeline-item:hover .timeline-text {
    color: #60a5fa;
  }

  .timeline-item::before {
    border-color: var(--timeline-dot-border, #68717d);
  }
}

/* Animation for initial load */
.timeline-item {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 0.8;
    transform: translateY(0);
  }
}

/* Add index-based animation delay */
.timeline-item:nth-child(1) {
  --index: 0;
}

.timeline-item:nth-child(2) {
  --index: 1;
}

.timeline-item:nth-child(3) {
  --index: 2;
}

.timeline-item:nth-child(4) {
  --index: 3;
}

.timeline-item:nth-child(5) {
  --index: 4;
}

.timeline-item:nth-child(6) {
  --index: 5;
}

.timeline-item:nth-child(7) {
  --index: 6;
}

.timeline-item:nth-child(8) {
  --index: 7;
}

.timeline-item:nth-child(9) {
  --index: 8;
}

.timeline-item:nth-child(10) {
  --index: 9;
}
</style>