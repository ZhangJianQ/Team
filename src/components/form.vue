<template>
  <form action=""
        class="form"
        :class="[labelPosition?'el-form--label-'+labelPosition:'',
        {'el-form--inline':inline}]"></form>
</template>

<script>
export default {
  name: 'Form',
  componentName: 'Form',
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
    disabled: Boolean
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
  methods: {
    resetFields() {
      if (!this.model) {
        return
      }

      this.field.forEach(field => {
        field.resetField()
      })
    },
    clearValidate(props = []) {
      const fields = props.length
    },
    validate(callback) {
      if (!this.model) {
        return
      }

      let promise

      if (typeof callback !== 'function' && window.Promise) {
        promise = new window.Promise((resolve, reject) => {
          callback = function (valid) {
            valid ? resolve(valid) : reject(valid)
          }
        })
      }

      let valid = true
      let count = 0 // 错误个数
      if (this.fields.length === 0 && callback) {
        callback(true)
      }
      let invalidFields = {}
      this.fields.forEach(field => {
        field.validate('', (message, field) => {
          if (message) {
            valid = false
          }
          invalidFields = Object.assign({}, invalidFields, field)
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
    validateField(props, callback) {
      props = [].concat(props)
      const fields = this.fields.filter(
        field => props.indexOf(field.prop) !== -1
      )
      if (fields.length) {
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

