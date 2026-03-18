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

  // Root trigger element
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

  // Invalid state
  &--invalid :deep(.pv-select__root) {
    border-color: var(--pv-danger, #EF4444);

    &[data-p-focused='true'] {
      border-color: var(--pv-danger, #EF4444);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }
  }

  // Label (selected value text)
  :deep(.pv-select__label) {
    @include pv-font;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-p-placeholder='true'] {
      color: var(--pv-text-muted, #94a3b8);
    }
  }

  // Dropdown trigger arrow
  :deep(.pv-select__dropdown-trigger) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  :deep(.pv-select__dropdown-icon) {
    width: 12px;
    height: 12px;
    color: var(--pv-text-muted, #94a3b8);
  }

  // Overlay panel
  :deep(.pv-select__overlay) {
    @include pv-dropdown;
    margin-top: 4px;
    z-index: 100;
  }

  // Header (filter area)
  :deep(.pv-select__header) {
    padding: 8px;
    border-bottom: 1px solid var(--pv-border, #e2e8f0);
  }

  // Filter input
  :deep(.pv-select__filter-input) {
    @include pv-input-base;
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;

    &:focus {
      @include pv-focus-ring;
    }
  }

  // List container
  :deep(.pv-select__list-container) {
    max-height: 14rem;
    overflow-y: auto;
  }

  // List
  :deep(.pv-select__list) {
    list-style: none;
    margin: 0;
    padding: 4px 0;
  }

  // Option items
  :deep(.pv-select__option) {
    @include pv-dropdown-item;
    @include pv-font;
    display: flex;
    align-items: center;

    &[data-p-selected='true'] {
      background-color: var(--pv-primary-light, #dbeafe);
      color: var(--pv-primary, #3B82F6);
      font-weight: 500;
    }

    &[data-p-focused='true'] {
      background-color: var(--pv-primary-light, #dbeafe);
    }

    &[data-p-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // Option label text
  :deep(.pv-select__option-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // Empty message
  :deep(.pv-select__empty-message) {
    @include pv-font;
    padding: var(--pv-input-py, 10px) var(--pv-input-px, 14px);
    color: var(--pv-text-muted, #94a3b8);
  }

  // Hidden form input
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
