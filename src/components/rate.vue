<template>

</template>

<script>
export default {
  name: 'Rate',
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  data: {
    pointerAtLeftHalf: true,
    currentValue: this.value,
    hoverIndex: -1 // 用于设置当前高亮
  },
  computed: {
    text() {
      // 设置选中不同图标个数下的文字
    },
    decimalStyle() {
      // 包含小数部分的图标样式
    }
  },
  watch: {
    value(val) {
      // 设置 currentValue 的值
    }
  },
  methods: {
    /**
     * 设置 value 的值
     */
    selectValue(value) {},
    /**
     * 设置临时值 currentValue
     */
    setCurrentValue(value, evt) {},
    /**
     * 用 value 的值还原 currentValue
     */
    resetCurrentValue() {},
    /**
     * 根据键盘事件设置 value 和 currentValue 的值
     */
    handleKey(evt) {},
    /**
     * 设置图标的高亮颜色
     */
    getIconStyle(item) {},
    /**
     * 设置图标小数部分的样式, 颜色和宽度
     */
    showDecimalIcon(item) {}
  }
}
</script>