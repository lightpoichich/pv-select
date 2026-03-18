<template>
  <div class="pv-select">
    <div class="pv-select__inner" :class="{ 'pv-select--invalid': props.content?.invalid }">
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
        unstyled
        :pt="passthrough"
        :appendTo="appendTarget"
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
import { computed, watch, inject, toValue, onMounted, ref } from 'vue';
import { installPrimeVue } from '../shared/install-primevue.js';
import Select from 'primevue/select';

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
    installPrimeVue();

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

    // PassThrough
    const passthrough = {
      root: { class: 'pv-select__root' },
      label: { class: 'pv-select__label' },
      dropdown: { class: 'pv-select__dropdown-trigger' },
      dropdownIcon: { class: 'pv-select__dropdown-icon' },
      overlay: { class: 'pv-select__overlay' },
      header: { class: 'pv-select__header' },
      pcFilter: { root: { class: 'pv-select__filter-input' } },
      listContainer: { class: 'pv-select__list-container' },
      list: { class: 'pv-select__list' },
      option: { class: 'pv-select__option' },
      optionLabel: { class: 'pv-select__option-label' },
      emptyMessage: { class: 'pv-select__empty-message' },
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
      passthrough,
      appendTarget,
      /* wwEditor:start */
      selectForm,
      /* wwEditor:end */
    };
  },
};
</script>

<style scoped lang="scss">
@import '../shared/styles/base';
@import '../shared/styles/tokens';

.pv-select {
  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
  }

  // Root trigger element (child of component, needs :deep)
  :deep(.pv-select__root) {
    @include pv-input-base;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    gap: 8px;

    &[data-p-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &[data-p-focused='true'] {
      @include pv-focus-ring;
    }
  }

  &--invalid :deep(.pv-select__root) {
    border-color: var(--pv-danger, #EF4444);

    &[data-p-focused='true'] {
      border-color: var(--pv-danger, #EF4444);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }
  }

  :deep(.pv-select__label) {
    font-family: var(--pv-font, Inter, system-ui, sans-serif);
    font-size: var(--pv-font-size, 14px);
    color: var(--pv-text, #0f172a);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-p-placeholder='true'] {
      color: var(--pv-text-muted, #94a3b8);
    }
  }

  :deep(.pv-select__dropdown-trigger) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  :deep(.pv-select__dropdown-icon) {
    width: 14px;
    height: 14px;
    color: var(--pv-text-muted, #94a3b8);
  }

  &__fake-input {
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
}
</style>

<!-- Unscoped: overlay is teleported to body, scoped styles can't reach it -->
<style lang="scss">
.pv-select__overlay {
  background: white;
  border: 1px solid var(--pv-border, #e2e8f0);
  border-radius: var(--pv-radius, 8px);
  box-shadow: var(--pv-shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
  margin-top: 4px;
  overflow: hidden;
  z-index: 1000;
}

.pv-select__header {
  padding: 8px;
  border-bottom: 1px solid var(--pv-border, #e2e8f0);
}

.pv-select__filter-input {
  font-family: var(--pv-font, Inter, system-ui, sans-serif);
  font-size: var(--pv-font-size, 14px);
  color: var(--pv-text, #0f172a);
  background: var(--pv-surface, #f8fafc);
  border: 1px solid var(--pv-border, #e2e8f0);
  border-radius: var(--pv-radius, 8px);
  padding: 8px 12px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--pv-transition, 150ms),
              box-shadow var(--pv-transition, 150ms);

  &::placeholder {
    color: var(--pv-text-muted, #94a3b8);
  }

  &:focus {
    border-color: var(--pv-primary, #3B82F6);
    box-shadow: 0 0 0 2px var(--pv-focus-ring, rgba(59, 130, 246, 0.3));
  }
}

.pv-select__list-container {
  max-height: 14rem;
  overflow-y: auto;
}

.pv-select__list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.pv-select__option {
  font-family: var(--pv-font, Inter, system-ui, sans-serif);
  font-size: var(--pv-font-size, 14px);
  color: var(--pv-text, #0f172a);
  padding: var(--pv-input-py, 10px) var(--pv-input-px, 14px);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color var(--pv-transition, 150ms);

  &:hover {
    background-color: var(--pv-primary-light, #dbeafe);
  }

  &[data-p-selected='true'] {
    background-color: var(--pv-primary, #3B82F6);
    color: var(--pv-primary-contrast, #ffffff);
    font-weight: 500;
  }

  &[data-p-focused='true']:not([data-p-selected='true']) {
    background-color: var(--pv-primary-light, #dbeafe);
  }

  &[data-p-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pv-select__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pv-select__empty-message {
  font-family: var(--pv-font, Inter, system-ui, sans-serif);
  font-size: var(--pv-font-size, 14px);
  padding: var(--pv-input-py, 10px) var(--pv-input-px, 14px);
  color: var(--pv-text-muted, #94a3b8);
}
</style>
