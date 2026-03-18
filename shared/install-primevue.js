import { getCurrentInstance } from 'vue';
import PrimeVuePlugin from 'primevue/config';
import ToastService from 'primevue/toastservice';

let installed = false;

/**
 * Install PrimeVue on the WeWeb Vue app instance.
 * Safe to call from multiple components — installs only once.
 * Must be called inside setup() so getCurrentInstance() works.
 */
export function installPrimeVue() {
  if (installed) return;
  const instance = getCurrentInstance();
  if (!instance) return;
  const app = instance.appContext.app;
  app.use(PrimeVuePlugin, {
    unstyled: true,
    theme: 'none',
  });
  app.use(ToastService);
  installed = true;
}
