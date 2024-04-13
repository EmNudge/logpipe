---
layout: home

hero:
  name: Logpipe
  text: A web UI for development logs
  tagline: Analyze live local logs like never before
  image:
    src: /logo.png
    alt: Logpipe
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quickstart
    - theme: alt
      text: View Demo
      link: https://logpipe-demo.emnudge.dev/

features:
  - icon: 🌈
    title: Automatic Syntax Highlighting
    details: Get some color on your white-on-black terminal text
  - icon: ✂️
    title: Keyboard Shortcuts
    details: Developer-friendly and command palette included
  - icon: 🔍
    title: Custom Query Language
    details: Because that's what the world needed right now
---


<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #c477b7 30%, #ed0000);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #fe34e1 50%, #ffbb47 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>