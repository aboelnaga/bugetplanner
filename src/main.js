import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import App from './App.vue'

// PrimeVue Theme Setup
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';


const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
      preset: Aura,
      options: {
          darkModeSelector: '.app-dark'
      }
  }
});
app.use(ConfirmationService)
app.use(ToastService)
app.mount('#app') 