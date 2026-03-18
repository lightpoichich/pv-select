import { getCurrentInstance } from 'vue';
import PrimeVuePlugin from 'primevue/config';
import ToastService from 'primevue/toastservice';

let installed = false;

/**
 * Install PrimeVue on the WeWeb Vue app instance.
 * Safe to call from multiple components — installs only once.
 * Must be called inside setup() so getCurrentInstance() works.
 *
 * @param {Object} [preset] — PrimeVue theme preset (e.g. from definePreset(Aura, {...})).
 *   If provided, PrimeVue runs in styled mode. If omitted, runs in unstyled mode (legacy).
 */
export function installPrimeVue(preset) {
  if (installed) return;
  const instance = getCurrentInstance();
  if (!instance) return;
  const app = instance.appContext.app;

  const config = preset
    ? { theme: { preset, options: { cssLayer: false, darkModeSelector: false } } }
    : { unstyled: true, theme: 'none' };

  app.use(PrimeVuePlugin, config);
  app.use(ToastService);
  installed = true;
}
