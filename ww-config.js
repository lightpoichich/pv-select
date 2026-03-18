export default {
  editor: {
    label: { en: 'PV Select' },
    icon: 'select',
    customSettingsPropertiesOrder: [
      'formInfobox',
      ['fieldName', 'customValidation', 'validation'],
      'options',
      'optionsLabelFormula',
      'optionsValueFormula',
      'initialValue',
      'placeholder',
      'filter',
      'invalid',
      'disabled',
      'readonly',
      'required',
    ],
  },
  triggerEvents: [
    { name: 'change', label: { en: 'On change' }, event: { value: '', item: null }, default: true },
    { name: 'initValueChange', label: { en: 'On init value change' }, event: { value: '' } },
    { name: 'open', label: { en: 'On open' }, event: {} },
    { name: 'close', label: { en: 'On close' }, event: {} },
  ],
  properties: {
    options: {
      label: { en: 'Options' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
      ],
      /* wwEditor:start */
      bindingValidation: {
        validations: [
          {
            type: 'array',
          },
          {
            type: 'object',
          },
        ],
        tooltip: 'A collection or an array of data: \n\n`myCollection` or `[{}, {}, ...]`',
      },
      /* wwEditor:end */
    },
    optionsLabelFormula: {
      label: { en: 'Label per item' },
      type: 'Formula',
      options: (content) => ({
        template: Array.isArray(content.options) ? content.options[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['label'] || context.mapping",
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip:
          'The label of the current option item. For primitive values (strings, numbers), use context.mapping directly. For objects, use context.mapping?.["label"]. This will be executed for each item in the options to return the label.',
      },
      /* wwEditor:end */
      section: 'settings',
    },
    optionsValueFormula: {
      label: { en: 'Value per item' },
      type: 'Formula',
      options: (content) => ({
        template: Array.isArray(content.options) ? content.options[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['value'] || context.mapping",
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip:
          'The value of the current option item. For primitive values (strings, numbers), use context.mapping directly. For objects, use context.mapping?.["value"]. This will be executed for each item in the options to return the value.',
      },
      /* wwEditor:end */
      section: 'settings',
    },
    initialValue: {
      label: { en: 'Initial value' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Initial selected value',
      },
      /* wwEditor:end */
    },
    placeholder: {
      label: { en: 'Placeholder' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Select an option',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Placeholder text when no option is selected',
      },
      /* wwEditor:end */
    },
    filter: {
      label: { en: 'Filter (search)' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable search/filter in dropdown: true | false',
      },
      /* wwEditor:end */
    },
    disabled: {
      label: { en: 'Disabled' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Disable the select: true | false',
      },
      /* wwEditor:end */
    },
    readonly: {
      label: { en: 'Read only' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Read only mode: true | false',
      },
      /* wwEditor:end */
    },
    invalid: {
      label: { en: 'Invalid' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show invalid/error state: true | false',
      },
      /* wwEditor:end */
    },
    required: {
      label: { en: 'Required' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Required for form validation: true | false',
      },
      /* wwEditor:end */
    },
    /* wwEditor:start */
    form: {
      editorOnly: true,
      hidden: true,
      defaultValue: false,
    },
    formInfobox: {
      type: 'InfoBox',
      section: 'settings',
      options: (_, sidePanelContent) => ({
        variant: sidePanelContent.form?.name ? 'success' : 'warning',
        icon: 'pencil',
        title: sidePanelContent.form?.name || 'Unnamed form',
        content: !sidePanelContent.form?.name && 'Give your form a meaningful name.',
        cta: {
          label: 'Select form',
          action: 'selectForm',
        },
      }),
      hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
    },
    /* wwEditor:end */
    fieldName: {
      label: { en: 'Field name' },
      section: 'settings',
      type: 'Text',
      defaultValue: '',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'The field name for form submission.',
      },
      /* wwEditor:end */
      hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
    },
    customValidation: {
      label: { en: 'Custom validation' },
      section: 'settings',
      type: 'OnOff',
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable custom validation rules.',
      },
      /* wwEditor:end */
      hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
    },
    validation: {
      label: { en: 'Validation' },
      section: 'settings',
      type: 'Formula',
      defaultValue: '',
      bindable: false,
      hidden: (content, sidePanelContent) =>
        !sidePanelContent.form?.uid || !content?.customValidation,
    },
  },
};
