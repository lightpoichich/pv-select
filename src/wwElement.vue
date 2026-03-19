<template>
  <div class="pv-select">
    <div class="pv-select__inner">
      <PvSelect
        :modelValue="internalValue"
        :options="mappedOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="props.content?.placeholder"
        :disabled="props.content?.disabled"
        :invalid="props.content?.invalid"
        :filter="props.content?.filter"
        :resetFilterOnHide="true"
        :autoFilterFocus="true"
        :appendTo="appendTarget"
        fluid
        @update:modelValue="handleChange"
        @show="handleShow"
        @hide="handleHide"
      />
      <input
        type="hidden"
        :name="props.content?.fieldName"
        :value="internalValue"
        :required="props.content?.required"
        tabindex="-1"
        class="pv-select__fake-input"
      />
    </div>
  </div>
</template>

<script>
import { computed, watch, inject, onMounted, ref } from 'vue';
import { installPrimeVue } from '../shared/install-primevue.js';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import Select from 'primevue/select';

const WeWebPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#3B82F6', 600: '#2563eb', 700: '#1d4ed8',
      800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569',
          700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
      },
    },
  },
});

export default {
  components: { PvSelect: Select },
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    wwElementState: { type: Object, default: () => ({}) },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    installPrimeVue(WeWebPreset);

    const { resolveMappingFormula } = wwLib.wwFormula.useFormula();

    // Append target for overlay
    const appendTarget = ref('self');
    onMounted(() => {
      const frontDoc = wwLib.getFrontDocument();
      if (frontDoc?.body) {
        appendTarget.value = frontDoc.body;
      }
    });

    // Internal variables
    const { value: internalValue, setValue: setInternalValue } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'value',
        type: 'string',
        defaultValue: '',
      });

    const { value: selectedItem, setValue: setSelectedItem } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'selectedItem',
        type: 'object',
        defaultValue: null,
      });

    // Map raw options through formulas
    const mappedOptions = computed(() => {
      const raw = props.content?.options;
      if (!Array.isArray(raw)) return [];

      const labelFormula = props.content?.optionsLabelFormula;
      const valueFormula = props.content?.optionsValueFormula;

      return raw.map((item) => {
        const isPrimitive = typeof item !== 'object' || item === null;
        let label, value;

        if (isPrimitive) {
          label = String(item);
          value = item;
        } else {
          label = resolveMappingFormula(labelFormula, item) ?? item.label ?? item.text ?? String(item);
          value = resolveMappingFormula(valueFormula, item) ?? item.value ?? item;
        }

        return { label: String(label), value, _data: item };
      });
    });

    // Find the full item object for a given value
    const findItemByValue = (val) => {
      return mappedOptions.value.find((opt) => opt.value === val) || null;
    };

    // Sync initialValue
    watch(
      () => props.content?.initialValue,
      (v) => {
        if (v !== undefined) {
          setInternalValue(v);
          const item = findItemByValue(v);
          setSelectedItem(item?._data || null);
          emit('trigger-event', { name: 'initValueChange', event: { value: v } });
        }
      },
      { immediate: true }
    );

    // Event handlers
    const handleChange = (newVal) => {
      if (internalValue.value !== newVal) {
        setInternalValue(newVal);
        const item = findItemByValue(newVal);
        setSelectedItem(item?._data || null);
        emit('trigger-event', {
          name: 'change',
          event: { value: newVal, item: item?._data || null },
        });
      }
    };

    const handleShow = () => {
      emit('trigger-event', { name: 'open', event: {} });
    };

    const handleHide = () => {
      emit('trigger-event', { name: 'close', event: {} });
    };

    // Form integration
    const fieldName = computed(() => props.content?.fieldName || props.wwElementState?.name);
    const validation = computed(() => props.content?.validation);
    const customValidation = computed(() => props.content?.customValidation);
    const initValue = computed(() => props.content?.initialValue ?? '');

    const useForm = inject('_wwForm:useForm', () => {});
    useForm(
      internalValue,
      { fieldName, validation, customValidation, initialValue: initValue },
      { elementState: props.wwElementState, emit, sidepanelFormPath: 'form', setValue: setInternalValue }
    );

    /* wwEditor:start */
    const selectForm = inject('_wwForm:selectForm', () => {});
    /* wwEditor:end */

    return {
      props,
      internalValue,
      selectedItem,
      mappedOptions,
      handleChange,
      handleShow,
      handleHide,
      appendTarget,
      /* wwEditor:start */
      selectForm,
      /* wwEditor:end */
    };
  },
};
</script>

<style scoped>
.pv-select__inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.pv-select__fake-input {
  background: rgba(0, 0, 0, 0);
  border: 0;
  bottom: -1px;
  font-size: 0;
  height: 1px;
  left: 0;
  outline: none;
  padding: 0;
  position: absolute;
  right: 0;
  width: 100%;
}
</style>
