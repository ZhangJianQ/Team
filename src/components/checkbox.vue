<template>
  <label
    class="checkbox"
    :class="{ 'is-disabled': isDisabled, 'is-checked': isChecked }"
  >
    <span class="checkbox__input">
      <input
        type="checkbox"
        v-model="model"
        :disabled="isDisabled"
        @change="handleChange"
      />
    </span>
    <span class="checkbox__label">
      <slot></slot>
    </span>
  </label>
</template>
<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //
    }
  },
  // 根据祖先组件设置当前组件的尺寸
  inject: {
    form: {
      default: ''
    }
  },
  computed: {
    // 双向数据绑定
    model: {
      get() {
        return this.isGroup ? this.store : this.value
      },
      set(val) {
        if (this.isGroup) {
          this.isLimitExceeded = false
        } else {
          this.$emit('input', val)
        }
      }
    },
    isChecked() {
      if (typeof this.model === 'boolean') {
        return this.model
      } else if (Array.isArray(this.model)) {
        return this.model.indexOf(this.label) !== -1
      } else {
        return this.model === this.trueLabel
      }
    },
    isDisabled() {
      return this.isGroup ? this._checkboxGroup.disabled : this.disabled
    },
    isGroup() {
      let parent = this.$parent
      while (parent) {
        if (parent.$options.componentName !== 'checkboxGroup') {
          parent = parent.$parent
        } else {
          return true
        }
      }
      return false
    }
  },
  methods: {
    addToStore() {
      if (Array.isArray(this.model) && this.model.indexOf(this.label) === -1) {
        this.model.push(this.label)
      } else {
        this.model = this.trueLabel || true
      }
    },
    handleChange(e) {
      // 根据用户设置返回 checkbox 的值
      let value = ''
      if (e.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel
      }
      this.$emit('change', value)
    }
  }
}
</script>