import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Logpipe",
  description: "Analyze your live development logs using a sleek web UI",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quickstart" },
      { text: "Github", link: "https://github.com/EmNudge/logpipe" },
      { text: "Demo", link: "https://logpipe-demo.emnudge.dev/" },
    ],
    sidebar: {
      '/guide/': { base: '/guide/', items: [
        {
          text: 'Guide',
          items: [
            { text: 'Quickstart', link: 'quickstart' },
            { text: 'Motivation', link: 'motivation' },
            { text: 'Alternatives', link: 'alternatives' },
            { text: 'Filtering', link: 'filtering' },
            { text: 'Command Palette', link: 'command-palette' },
          ]
        }
      ] },
    }
  },
});
