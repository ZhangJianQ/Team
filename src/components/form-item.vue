<template>
  <div class="form-item"
       :class="{
      'is-error': validateState === 'error',
      'is-validating': validateState === 'validating',
      'is-suceess': validateState === 'success',
      'is-required': isRequired || required
    }">
    <label for=""
           class="form-item__label"
           :style="labelStyle"
           v-if="label || $slots.label">
      <slot name="label"> {{ label + form.labelSuffix }}</slot>
    </label>
    <div class="form-item__content"
         :style="contentStyle">
      <slot></slot>
      <slot v-if="validateState === 'error' && showMessage && form.showMessage"
            name="error"
            :error="validateMessage">
        <div class="form-item__error"
             :class="{
            'form-itemm__error--inline':
              typeof inlineMessage === 'boolean'
                ? inlineMessage
                : (elForm && elForm.inlineMessage) || false
          }">
          {{ validateMessage }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import Emitter from '../mixins/emitter'
import AsyncValidator from 'async-validator'
import { getPropByPath } from '@/utils/util'

export default {
  name: 'FormItem',
  componentName: 'FormItem',
  mixins: [Emitter],
  provide() {
    return {
      FormItem: this
    }
  },
  inject: ['elForm'],
  props: {
    label: String,
    prop: String,
    required: {
      type: Boolean,
      default: false
    },
    rules: [Object, Array],
    error: String,
    validateStatus: String,
    inlineMessage: {
      type: [String, Boolean],
      default: ''
    },
    showMessage: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    error: {
      immediate: true,
      handler(val) {
        this.validateMessage = val
        this.validateState = val ? 'error' : ''
      }
    },
    validateStatus(val) {
      this.validateState = val
    }
  },
  computed: {
    labelStyle() {
      const ret = {}
      if (this.form.labelPosition === 'top') return ret
      const labelWidth = this.labelWidth || this.form.labelWidth
      if (labelWidth) {
        ret.width = labelWidth
      }
      return ret
    },
    form() {
      // 遍历父节点找到 form 节点
      let parent = this.$parent
      let parentName = parent.$options.componentName
      while (parentName !== 'Form') {
        if (parentName === 'FormItem') {
          this.isNested = true
        }
        parent = parent.$parent
        parentName = parent.$options.componentName
      }
      return parent
    },
    fieldValue() {
      const model = this.form.model

      if (!model || !this.prop) return

      let path = this.prop
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.')
      }

      return getPropByPath(model, path, true).validateState
    },
    isRequired() {
      let rules = this.getRules()
      let isRequired = false

      if (rules && rules.length) {
        rules.every(rule => {
          if (rule.required) {
            isRequired = true
            return false
          }
          return true
        })
      }
      return isRequired
    },
    contentStyle() {
      const ret = {}
      const label = this.label
      if (this.form.labelPosition === 'top' || this.form.inline) return ret
      if (!label && !this.labelWidth && this.isNested) return ret
      const labelWidth = this.labelWidth || this.form.labelWidth

      ret.marginLeft = labelWidth

      return ret
    }
  },
  data() {
    return {
      validateState: '',
      validateMessage: '',
      validateDisabled: false,
      isNested: false,
      validator: {}
    }
  },
  methods: {
    /**
     * 创建表单验证
     */
    validate(trigger, callback) {
      callback = callback || function () {}
      this.validateDisabled = false
      const rules = this.getFilteredRule(trigger)
      if ((!rules || rules.length === 0) && this.required === undefined) {
        callback()
        return true
      }

      this.validateState = 'validating'

      const descriptor = {}
      if (rules && rules.length > 0) {
        rules.forEach(rule => {
          delete rule.trigger
        })
      }
      descriptor[this.prop] = rules

      const validator = new AsyncValidator(descriptor)
      const model = {}

      model[this.prop] = this.fieldValue

      validator.validate(
        model,
        { firstFields: true },
        (errors, invalidFields) => {
          this.validateState = !errors ? 'success' : 'error'
          this.validateMessage = errors ? errors[0].message : ''

          callback(this.validateMessage, invalidFields)
          this.elForm &&
            this.elForm.$emit(
              'validate',
              this.prop,
              !errors,
              this.validateMessage || null
            )
        }
      )
    },
    clearValidate() {
      this.validateState = ''
      this.validateMessage = ''
      this.validateDisabled = false
    },
    resetField() {
      this.validateState = ''
      this.validateMessage = ''

      let model = this.form.model
      let value = this.fieldValue
      let path = this.prop
      if (path.indexOf(':') > -1) {
        path.path.replace(/:/, '.')
      }
      let prop = getPropByPath(model, path, value)

      this.validateDisabled = true
      if (Array.isArray(value)) {
        prop.o[prop.k] = [].concat(this.initialValue)
      } else {
        prop.o[prop.k] = this.initialValue
      }

      this.$nextTick(() => {
        this.validateDisabled = false
      })

      this.broadcast('ElTimeSelect', 'fieldReset', this.initialValue)
    },
    /**
     * 整合formItem rules, form rules 和 required rule
     */
    getRules() {
      let formRules = this.form.rules
      const selfRules = this.rules
      const requiredRule =
        this.required !== undefined ? { required: !!this.required } : []
      const prop = getPropByPath(formRules, this.prop || '')

      formRules = formRules ? prop.o[this.prop || ''] || prop.v : []
      return [].concat(selfRules || formRules || []).concat(requiredRule)
    },
    getFilteredRule(trigger) {
      const rules = this.getRules()

      return rules
        .filter(rule => {
          if (!rule.trigger || trigger === '') return true

          if (Array.isArray(rule.trigger)) {
            return rules.trigger.indexOf(trigger) > -1
          } else {
            return rule.trigger === trigger
          }
        })
        .map(rule => Object.assign({}, rule))
    },
    /**
     * 设置不同类型的触发器
     */
    onFieldBlur() {
      this.validate('blur')
    },
    onFieldChange() {
      if (this.validateDisabled) {
        this.validateDisabled = false
        return
      }

      this.validate('change')
    },
    /**
     * 接收来自表单组件提交的事件
     * input, textarea - dispatch('ElFormItem', 'form.blur', [this.value])
     */
    addValidateEvents() {
      const rules = this.getRules()
      if (rules.length || this.required !== undefined) {
        this.$on('form.blur', this.onFieldBlur)
        this.$on('form.change', this.onFieldChange)
      }
    },
    removeValidateEvents() {
      this.$off()
    }
  },
  mounted() {
    // 将验证项提交到父组件
    if (this.prop) {
      this.dispatch('Form', 'form.addField', [this])

      let initialValue = this.fieldValue
      if (Array.isArray(initialValue)) {
        initialValue = [].concat(initialValue)
      }
      Object.defineProperty(this, 'initialValue', {
        value: initialValue
      })

      this.addValidateEvents()
    }
  },
  beforeDestroy() {
    this.dispatch('Form', 'form.removeField', [this])
  }
}
</script>

<style lang="scss">
.form-item__label {
  float: left;
}

.is-error {
  input,
  select,
  textarea {
    border-color: red;
  }
}
</style>