<script setup lang="ts">
const { count = 10 } = defineProps<{
  count?: number
}>()

const icons = ['❅', '❆']

const snowflakes = Array.from({ length: count }, (_, index) => ({
  id: index,
  icon: icons[Math.floor(Math.random() * icons.length)],
}))

</script>

<template>
  <div class="snowflakes" role="presentation" aria-label="Decorative snowfall animation">
    <div v-for="snowflake in snowflakes" :key="snowflake.id" class="snowflake" role="presentation" aria-hidden="true">
      {{ snowflake.icon }}
    </div>
  </div>
</template>

<style scoped>
/* customizable snowflake styling */
.snowflake {
  color: #fff;
  font-size: 1em;
  font-family: Arial;
  text-shadow: 0 0 1px #000;
}

@-webkit-keyframes snowflakes-fall {
  0% {
    top: -10%
  }

  100% {
    top: 100%
  }
}

@-webkit-keyframes snowflakes-shake {
  0% {
    transform: translateX(0px)
  }

  50% {
    transform: translateX(80px)
  }

  100% {
    transform: translateX(0px)
  }
}

@keyframes snowflakes-fall {
  0% {
    top: -10%
  }

  100% {
    top: 100%
  }
}

@keyframes snowflakes-shake {
  0% {
    transform: translateX(0px)
  }

  50% {
    transform: translateX(80px)
  }

  100% {
    transform: translateX(0px)
  }
}

.snowflake {
  position: fixed;
  top: -10%;
  z-index: 9999;
  user-select: none;
  cursor: default;
  animation-name: snowflakes-fall, snowflakes-shake;
  animation-duration: 10s, 3s;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  animation-play-state: running, running
}

.snowflake:nth-of-type(0) {
  left: 1%;
  animation-delay: 0s, 0s
}

.snowflake:nth-of-type(1) {
  left: 10%;
  animation-delay: 1s, 1s
}

.snowflake:nth-of-type(2) {
  left: 20%;
  animation-delay: 6s, .5s
}

.snowflake:nth-of-type(3) {
  left: 30%;
  animation-delay: 4s, 2s
}

.snowflake:nth-of-type(4) {
  left: 40%;
  animation-delay: 2s, 2s
}

.snowflake:nth-of-type(5) {
  left: 50%;
  animation-delay: 8s, 3s
}

.snowflake:nth-of-type(6) {
  left: 60%;
  animation-delay: 6s, 2s
}

.snowflake:nth-of-type(7) {
  left: 70%;
  animation-delay: 2.5s, 1s
}

.snowflake:nth-of-type(8) {
  left: 80%;
  animation-delay: 1s, 0s
}

.snowflake:nth-of-type(9) {
  left: 90%;
  animation-delay: 3s, 1.5s
}
</style>