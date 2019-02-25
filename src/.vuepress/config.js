module.exports = {
  title: 'Salvatore Laisa',
  description: 'Blog personale.',
  base: '/',
  // theme: 'vuepress-theme-casper',
  head: [
    // ['link', { rel: 'icon', href: '/favicon.png' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#000000' }]
  ],
  markdown: {
    anchor: {
      permalink: false,
      permalinkBefore: false
    }
  },
  themeConfig: {
    cover: 'https://github.com/moebiusmania/blog-assets/blob/master/images/37146_1659639097009_5747307_n.jpg?raw=true',
    nav: [{
      text: 'Home',
      link: '/'
    }],

    footer: [{
      text: 'Twitter',
      link: 'https://twitter.com/moebiusmania'
    }, {
      text: 'Instagram',
      link: 'https://www.instagram.com/moebiusmania'
    },{
      text: 'Github',
      link: 'https://github.com/moebiusmania'
    }, {
      text: 'LinkedIn',
      link: 'https://www.linkedin.com/in/salvatorelaisa'
    }],
    social: {
      github: 'https://github.com/moebiusmania',
      twitter: 'https://twitter.com/moebiusmania',
      instagram: 'https://instagram.com/moebiusmania',
      linkedin: 'https://www.linkedin.com/in/salvatorelaisa'
    }
  },
  plugins: [
    // '@vuepress/last-updated',
    // '@vuepress/back-to-top',
    ['@vuepress/pwa', {
      'serviceWorker': true,
      'updatePopup': true,
    }]
  ]
}