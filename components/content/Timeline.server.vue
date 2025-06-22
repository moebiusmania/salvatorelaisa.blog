<script setup lang="ts">
interface Props {
  items: string;
  title?: string;
  description?: string;
}

const { items = "", title, description } = defineProps<Props>();
const list = items.split(",").filter(item => item.trim());

// Add methods for keyboard interaction
const handleItemClick = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('timeline-item')) {
    // Add any click handling logic here
    console.log('Timeline item clicked:', target.getAttribute('aria-label'));
  }
};
</script>

<template>
  <section class="timeline-container" role="region" :aria-label="title"
    :aria-describedby="description ? 'timeline-description' : undefined">
    <h2 v-if="title" class="timeline-title" id="timeline-title">{{ title }}</h2>
    <p v-if="description" class="timeline-description" id="timeline-description">{{ description }}</p>

    <ul class="timeline" role="list" :aria-label="`${list.length} timeline items`">
      <li v-for="(item, index) in list" :key="index" class="timeline-item" role="listitem" :tabindex="0"
        :aria-label="`Timeline item ${index + 1} of ${list.length}: ${item.trim()}`" @keydown.enter="handleItemClick"
        @keydown.space.prevent="handleItemClick">
        <div class="timeline-content">
          <span class="timeline-text">{{ item.trim() }}</span>
        </div>
      </li>
    </ul>

    <div class="sr-only" aria-live="polite" aria-atomic="true">
      Timeline with {{ list.length }} items loaded
    </div>
  </section>
</template>

<style scoped>
.timeline-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--sp-4) var(--sp-2);
}

.timeline-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: var(--sp-2);
  text-align: center;
}

.timeline-description {
  font-size: 1rem;
  color: var(--text-secondary, #6b7280);
  margin-bottom: var(--sp-4);
  text-align: center;
  line-height: 1.5;
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
  cursor: pointer;
  outline: none;
  border-radius: 8px;
}

.timeline-item:hover,
.timeline-item:focus {
  opacity: 1;
  transform: translateX(var(--sp-1));
}

.timeline-item:focus {
  outline: 2px solid var(--primary, #3b82f6);
  outline-offset: 2px;
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

.timeline-item:hover::before,
.timeline-item:focus::before {
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

.timeline-item:hover .timeline-content,
.timeline-item:focus .timeline-content {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary, #3b82f6);
}

.timeline-item:hover .timeline-content::before,
.timeline-item:focus .timeline-content::before {
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

.timeline-item:hover .timeline-text,
.timeline-item:focus .timeline-text {
  color: var(--primary, #3b82f6);
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  .timeline-title {
    color: var(--text-primary, #f9fafb);
  }

  .timeline-description {
    color: var(--text-secondary, #d1d5db);
  }

  .timeline-content {
    background: var(--timeline-item-bg, #2d3748);
    border-color: rgba(55, 65, 81, 0.8);
  }

  .timeline-text {
    color: #f9fafb;
  }

  .timeline-item:hover .timeline-text,
  .timeline-item:focus .timeline-text {
    color: #60a5fa;
  }

  .timeline-item::before {
    border-color: var(--timeline-dot-border, #68717d);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {

  .timeline-item,
  .timeline-item::before,
  .timeline-content,
  .timeline-content::before,
  .timeline-text {
    transition: none;
    animation: none;
  }

  .timeline-item:hover,
  .timeline-item:focus {
    transform: none;
  }

  .timeline-item:hover::before,
  .timeline-item:focus::before {
    transform: translateY(-50%);
  }

  .timeline-item:hover .timeline-content,
  .timeline-item:focus .timeline-content {
    transform: none;
  }

  .timeline-item:hover .timeline-content::before,
  .timeline-item:focus .timeline-content::before {
    transform: scaleX(1);
  }
}

/* Animation for initial load - only if motion is not reduced */
@media (prefers-reduced-motion: no-preference) {
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
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .timeline-item::before {
    border-width: 2px;
    border-color: #000;
  }

  .timeline-content {
    border-width: 2px;
    border-color: #000;
  }

  .timeline-item:focus {
    outline-width: 3px;
  }
}
</style>