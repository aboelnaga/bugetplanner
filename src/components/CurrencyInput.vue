<template>
  <input
    ref="inputRef"
    type="text"
    v-bind="$attrs"
    :placeholder="placeholder"
    :inputmode="inputmode"
    @blur="emitValue"
    @input="emitValue"
  />
</template>

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

const emit = defineEmits(['update:modelValue'])

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

const emitValue = () => {
  emit('update:modelValue', numberValue.value ?? 0)
}
</script>


