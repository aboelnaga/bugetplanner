<script setup>
import { watch } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  options: {
    type: Object,
    default: () => ({})
  },
  placeholder: {
    type: String,
    default: ''
  },
  inputmode: {
    type: String,
    default: 'decimal'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'input'])

const { inputRef, numberValue, setValue } = useCurrencyInput(props.options)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== numberValue.value) {
      setValue(val)
    }
  },
  { immediate: true }
)

const onInput = (e) => {
  emit('input', e)
  emit('update:modelValue', numberValue.value ?? 0)
}

const onBlur = (e) => {
  emit('blur', e)
  emit('update:modelValue', numberValue.value ?? 0)
  emit('change', numberValue.value ?? 0)
}

const onFocus = (e) => {
  emit('focus', e)
}
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    v-bind="$attrs"
    :placeholder="placeholder"
    :inputmode="inputmode"
    @blur="onBlur"
    @input="onInput"
    @focus="onFocus"
  >
</template>


