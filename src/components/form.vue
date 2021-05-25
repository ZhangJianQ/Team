<template>
  <form
    action=""
    class="form"
    :class="[
      labelPosition ? 'el-form--label-' + labelPosition : '',
      { 'el-form--inline': inline }
    ]"
  >
    <slot></slot>
  </form>
</template>

<script>
// 表单使用了命令模式，每个子项都有相同的 API
/**
 * 命令模式字段：resetField, clearValidate, validate, validateField
 */
import Emitter from '@/mixins/emitter'
export default {
  name: 'Form',
  componentName: 'Form',
  mixins: [Emitter],
  provide() {
    return {
      elForm: this
    }
  },
  props: {
    model: Object,
    rules: Object,
    labelPosition: String,
    labelWidth: String,
    inline: Boolean,
    disabled: Boolean,
    labelSuffix: {
      type: String,
      default: ''
    },
    showMessage: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    rules() {
      this.fields.forEach(field => {
        field.removeValidateEvents()
        field.addValidateEvents()
      })

      // 创建一个新的验证器
      if (this.validateOnRuleChange) {
        this.validate(() => {})
      }
    }
  },
  data() {
    return {
      fields: []
    }
  },
  created() {
    // 动态添加表单验证字段
    this.$on('form.addField', field => {
      if (field) {
        this.fields.push(field)
      }
    })

    this.$on('form.removeField', field => {
      if (field.prop) {
        this.fields.splice(this.fields.indexOf(field), 1)
      }
    })
  },
  methods: {
    /**
     * 使用命令模式重置所有字段的值
     */
    resetFields() {
      if (!this.model) {
        return
      }

      this.fields.forEach(field => {
        field.resetField()
      })
    },
    /**
     * 使用命令模式移除表单项的校验结果
     */
    clearValidate(props = []) {
      const fields = props.length
        ? typeof props === 'string'
          ? this.fields.filter(field => props === field.prop)
          : this.fields.filter(field => props.indexOf(field.prop) > -1)
        : this.fields
      fields.forEach(field => {
        field.clearValidate()
      })
    },
    /**
     * 触发表单验证
     */
    validate(callback) {
      if (!this.model) {
        return
      }

      let promise

      if (typeof callback !== 'function' && window.Promise) {
        promise = new window.Promise((resolve, reject) => {
          // 将 callback 设置成一个包装器
          callback = function (valid) {
            valid ? resolve(valid) : reject(valid)
          }
        })
      }

      let valid = true
      let count = 0 // 错误个数
      let invalidFields = {}

      if (this.fields.length === 0 && callback) {
        callback(true)
      }

      this.fields.forEach(field => {
        // 命令模式
        field.validate('', (message, field) => {
          if (message) {
            valid = false
          }
          invalidFields = Object.assign({}, invalidFields, field)

          // 所有字段验证完毕，执行回调
          if (
            typeof callback === 'function' &&
            ++count === this.fields.length
          ) {
            callback(valid, invalidFields)
          }
        })
      })

      if (promise) {
        return promise
      }
    },
    /**
     * 只校验指定的字段
     */
    validateField(props, callback) {
      props = [].concat(props)
      const fields = this.fields.filter(
        field => props.indexOf(field.prop) !== -1
      )
      if (fields.length === 0) {
        return
      }

      fields.forEach(field => {
        field.validate('', callback)
      })
    },
    getLabelWidthIndex(width) {
      //
    },
    registerLabelWidth(val, oldValue) {},
    deregisterLabelWidth(val) {
      //
    }
  }
}
</script>

