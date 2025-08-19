import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import App from './App.vue'

// PrimeVue Theme Setup
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primeuix/themes';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';


const pinia = createPinia()
const app = createApp(App)
const MyPreset = definePreset(Aura, {
  semantic: {
      colorScheme: {
          light: {
              surface: {
                  0: '#ffffff',
                  50: '{slate.50}',
                  100: '{slate.100}',
                  200: '{slate.200}',
                  300: '{slate.300}',
                  400: '{slate.400}',
                  500: '{slate.500}',
                  600: '{slate.600}',
                  700: '{slate.700}',
                  800: '{slate.800}',
                  900: '{slate.900}',
                  950: '{slate.950}'
              }
          },
          dark: {
              surface: {
                  0: '#ffffff',
                  50: '{slate.50}',
                  100: '{slate.100}',
                  200: '{slate.200}',
                  300: '{slate.300}',
                  400: '{slate.400}',
                  500: '{slate.500}',
                  600: '{slate.600}',
                  700: '{slate.700}',
                  800: '{slate.800}',
                  900: '{slate.900}',
                  950: '{slate.950}'
              }
          }
      }
  }
});

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
      preset: MyPreset,
      options: {
          darkModeSelector: '.app-dark'
      }
  }
});
app.use(ConfirmationService);
app.use(ToastService);
app.mount('#app') 