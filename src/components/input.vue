<template>
  <div
    :class="[
      type === 'textarea' ? 'el-textarea' : 'el-input',
      {
        'is-diabled': inputDisabled
      }
    ]"
    @mouseenter="hovering = true"
    @mouseout="hovering = false"
  >
    <template v-if="type !== 'textarea'">
      <input
        ref="input"
        v-if="type !== 'textarea'"
        :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
        class="el-input__innner"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleChange"
        :value="value"
      />
      <i
        class="input__icon"
        v-if="showPwdVisible"
        @click="handlePasswordVisible"
        >显示</i
      >
      <span class="input__stuffix">
        <span class="input__suffix-inner">
          <span v-if="isWordLimitVisible" class="el-input__count">
            <span class="el-input__count-inner">
              {{ textLength }}/{{ upperLimit }}
            </span>
          </span>
        </span>
      </span>
    </template>
    <textarea
      ref="textarea"
      v-else
      cols="30"
      rows="10"
      v-bind="$attrs"
      :value="value"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
    ></textarea>
    <span
      v-if="isWordLimitVisible && type === 'textarea'"
      class="el-input__count"
      >{{ textLength }}/{{ upperLimit }}</span
    >
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'ElInput',
  componentName: 'ElInput',
  inheritAttrs: false,
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  mixins: [Emitter],
  props: {
    value: [String, Number],
    type: String,
    form: String,
    disabled: Boolean,
    readonly: Boolean,
    showPassword: {
      type: Boolean,
      default: false
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    validateEvent: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.form || {}).disabled
    },
    validateState() {
      return this.FormItem ? this.FormItem.validateState : ''
    },
    showPwdVisible() {
      return this.showPassword && !this.inputDisabled && !this.readonly
    },
    isWordLimitVisible() {
      return (
        this.showWordLimit &&
        this.$attrs.maxlength &&
        (this.type === 'text' || this.type === 'textarea') &&
        !this.inputDisabled &&
        !this.readonly &&
        !this.showPassword
      )
    },
    textLength() {
      if (this.type === 'number') {
        return String(this.value).length
      }
      return (this.value || '').length
    },
    upperLimit() {
      return this.$attrs.maxlength
    },
    nativeInputValue() {
      return this.value === null || this.value === undefined
        ? ''
        : String(this.value)
    }
  },
  data() {
    return {
      hovering: false,
      focused: false,
      passwordVisible: false
    }
  },
  watch: {
    value(val) {
      this.resizeTextarea()
      if (this.validateEvent) {
        this.dispatch('FormItem', 'form.change', [val])
      }
    },
    type() {
      this.$nextTick(() => {
        this.setNativeInputValue()
        this.resizeTextarea()
      })
    }
  },
  created() {
    this.$on('inputSelect', this.select)
  },
  mounted() {
    this.setNativeInputValue()
    this.resizeTextarea()
  },
  methods: {
    focus() {
      this.getInput().focus()
    },
    blur() {
      this.getInput().blur()
    },
    handleInput(evt) {
      if (evt.target.value === this.nativeInputValue) return
      this.$emit('input', evt.target.value)
      this.setNativeInputValue
    },
    handleBlur(evt) {
      this.focused = false
      this.$emit('blur', evt)
      if (this.validateEvent) {
        this.dispatch('FormItem', 'form.blur', [this.value])
      }
    },
    handleFocus(evt) {
      this.focused = true
      this.$emit('focus', evt)
    },
    handleChange(evt) {
      this.$emit('change', evt.target.value)
    },
    handlePasswordVisible() {
      this.passwordVisible = !this.passwordVisible
    },
    /**
     * 不能直接修改 this.value 的值
     */
    setNativeInputValue() {
      const input = this.getInput()
      if (!input) return
      if (input.value === this.nativeInputValue) return
      input.value = this.nativeInputValue
    },
    getInput() {
      return this.$refs.input || this.$refs.textarea
    },
    resizeTextarea() {}
  }
}
</script>