import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),

    VueRouter(),

    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
        },
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    Components({
      dts: true,
      resolvers: [
        (name) => {
          if (name.startsWith('N'))
            return { name, from: 'naive-ui' }
        },
      ],
    }),

    Unocss(),
  ],

  test: {
    environment: 'jsdom',
  },
})
