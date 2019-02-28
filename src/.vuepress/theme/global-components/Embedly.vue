<template>
  
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.async = true;
    script.charset = 'UTF-8';
    script.src = '//cdn.embedly.com/widgets/platform.js';
    document.head.appendChild(script);
  }
}
</script>
