<template>
  <div ref="ig_embed"></div>
</template>

<script>

export default {
  props: {
    shortcode :{
      type: String,
      default: ''
    }
  },

  methods: {
    domContent(ref, data) {
      ref.style.width = `${data.width}px`;
      ref.innerHTML = data.html;
      return ref;
    },
    embedScript() {
      const script = document.createElement('script');
      script.async = true;
      script.src = '//www.instagram.com/embed.js';
      document.body.appendChild(script);
    }
  },

  mounted() {
    const code = this.shortcode;
    const ref = this.$refs.ig_embed;

    fetch(`https://api.instagram.com/oembed?url=http://instagr.am/p/${code}/`)
      .then(r => r.json())
      .then(data => this.domContent(ref, data))
      .then(node => this.embedScript())
  }
}
</script>

<style lang="scss" scoped>

  div {
    width: 100%;
    margin: 0 auto 20px;
  }

</style>
