// 时间选择器用到了策略模式
// 不同的时间选择器类型分割成不同的组件 date-table.vue month-table.vue year-table.vue time-spinner.vue
// picker.vue 是渲染容器
<template>
  <input v-if="isranged"
         ref="reference"
         type="text"
         class="date-editor"
         placeholder="单个时间选择器"
         @focus="handleFocus">
  <div v-else
       class="date-editor range-editor input__inner">
    <input type="text"
           class="range-input"
           placeholder="开始时间"
           @focus="handleFocus">
    <input type="text"
           class="range-input"
           placeholder="结束时间"
           @focus="handleFocus">
  </div>
</template>

<script>
// 时间格式化，策略模式
const DEFAULT_FORMATS = {
  date: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy'
}
// 内置时间
const HAVE_TRIGGER_TYPES = ['date', 'datetime', 'time', 'month']
// 时间格式化和时间解析方法
const DATE_FORMMATEER = function (value, format) {}
const DATE_PARSER = function (text, formate) {}
const RANGE_FORMATTER = function (value, format) {}
const RANGE_PARSER = function (array, format, separator) {}
// 定义不同规则的解析方法
const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {},
    parser(text) {}
  },
  week: {
    formatter(value) {},
    parser(text) {}
  },
  date: {
    formatter: DATE_FORMMATEER,
    parser: DATE_PARSER
  },
  datetime: {
    formatter: DATE_FORMMATEER,
    parser: DATE_PARSER
  },
  daterange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  datetimerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  timerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  time: {
    formatter: DATE_FORMMATEER,
    parser: DATE_PARSER
  },
  number: {
    formatter(value) {},
    parser(text) {}
  },
  dates: {
    formatter(value, format) {},
    parser(value, format) {}
  }
}
// 位置策略
const PLACEMENT_MAP = {
  left: 'bottom-start',
  center: 'bottom',
  right: 'bottom-end'
}
export default {
  props: {
    type: {
      type: String,
      default: 'date'
    },
    format: String,
    valueFormat: String,
    placeholder: String,
    disabled: Boolean,
    clearable: {
      type: Boolean,
      default: true
    },
    value: {} // 双向绑定
  },
  data() {
    return {
      pickerVisible: false //时间选择器
    }
  },
  computed: {
    isranged() {
      return this.type.indexOf('range') > -1
    },
    reference() {
      const reference = this.$refs.reference
      return reference.$el || reference
    },
    valueIsEmpty() {},
    selectionMode() {
      // 时间选择器只能是日、月、天、年、周
    },
    haveTrigger() {},
    displayValue() {
      // 显示格式化好的时间，字符串
    },
    parsedValue() {
      // 解析时间成 Date 对象
    }
  },
  methods: {
    focus() {
      if (!this.isranged) {
        this.$refs.reference.focus()
      } else {
        this.handleFocus()
      }
    },
    blur() {
      // 移出焦点
    },
    handleFocus() {
      const type = this.type

      if (HAVE_TRIGGER_TYPES.indexOf(type) !== -1 && this.pickerVisible) {
        this.pickerVisible = true
      }
      this.$emit('focus', this)
    },
    parseValue(value) {},
    formatToValue(date) {},
    parseString(value) {},
    formatToString(value) {},
    handleMouseEnter() {
      // 显示关闭按钮
    },
    handleChange() {
      // 格式化并提交数据
    },
    handleStartInput(evt) {
      // 设置开始时间
    },
    handleEndInput(evt) {
      // 设置结束时间
    },
    handleStartChange() {
      // 开始时间变化处理
    },
    handleEndChange() {
      // 结束时间变化处理
    },
    handleClickIcon() {
      // 时间图标触发器
    },
    handleClose() {
      // 关闭时间选择器
    },
    handleKeyDown(evt) {
      // 用户手动输入时间处理
    },
    handleRangeClick() {
      // 时间范围选择器
    },
    isValidValue(value) {
      // 检验时间有效性，并做相应的处理
    },
    mountPicker() {
      // 选择器渲染方法
    }
  }
}
</script>