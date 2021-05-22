<template>
  <div class="color-picker"
       :class="{'is-disabled':colorDisabled}">
    <div class="color-picker__mask"
         v-if="colorDisabled"></div>
    <div class="color-picker__trigger"
         @click="handleTrigger">
      <span class="color-picker__color">
        <div class="color-picker__color-inner"
             :style="{
             backgroundColor:displayedColor
           }"></div>
      </span>
      <div class="color-picker__icon"
           v-show="value || showPanelColor"></div>
    </div>
    <picker-dropdown ref="dropdown"
                     class="color-picker__panel"
                     v-model="showPicker"
                     @pick="confirmValue"
                     @clear="clearValue"
                     :color="color"
                     :show-alpha="showAlpha">
    </picker-dropdown>
  </div>
</template>

<script>
import Color from '@/utils/color'
import PickerDropdown from './picker-dropdown'
export default {
  name: 'ColorPicker',
  props: {
    disabled: Boolean,
    value: String,
    showAlpha: Boolean
  },
  components: {
    PickerDropdown
  },
  inject: {
    form: {
      default: ''
    },
    formItem: {
      default: ''
    }
  },
  data() {
    const color = new Color({
      enableAlpha: this.showAlpha,
      format: this.colorFormat
    })
    return {
      color,
      showPicker: false,
      showPanelColor: false
    }
  },
  computed: {
    colorDisabled() {
      return this.disabled || (this.form || {}).disabled
    },
    displayedColor() {
      if (!this.value && this.showPanelColor) {
        return 'transparent'
      }

      return this.displayedRgb(this.color, this.showAlpha)
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.showPanelColor = false
      } else if (val && val !== this.color.value) {
        this.color.fromString(val)
      }
    },
    color: {
      deep: true,
      handler() {
        this.showPanelColor = true
      }
    },
    displayedColor(val) {
      if (!this.showPicker) return

      const currentColor = new Color({
        enableAlpha: this.showAlpha,
        format: this.colorFormat
      })
      currentColor.fromString(this.value)

      const currentColorRgb = this.displayedRgb(currentColor, this.showAlpha)
      if (val !== currentColorRgb) {
        this.$emit('active-change', val)
      }
    }
  },
  methods: {
    handleTrigger() {
      // 打开颜色选择器
      if (this.colorDisabled) return

      this.showPicker = !this.showPicker
    },
    /**
     * 根据 Color 的对象属性设置当前颜色
     */
    displayedRgb(color, showAlpha) {
      if (!(color instanceof Color)) {
        throw Error('color should be instance of Color Class')
      }

      const { r, g, b } = color.toRgb()
      return showAlpha
        ? `rgba(${r},${g},${b}, ${color.get('alpha') / 100})`
        : `rgb(${r},${g},${b})`
    },
    confirmValue() {
      const value = this.color.value
      this.$emit('input', value)
      this.$emit('change', value)
      this.showPicker = false
    },
    clearValue() {
      this.$emit('input', null)
      this.$emit('change', null)

      this.showPicker = false
      this.resetColor()
    },
    resetColor() {
      this.$nextTick(() => {
        if (this.value) {
          this.color.fromString(this.value)
        } else {
          this.showPanelColor = false
        }
      })
    }
  },
  mounted() {
    const value = this.value
    if (value) {
      this.color.fromString(value)
    }
    // 不知何用
    this.popperElm = this.$refs.dropdown.$el
  }
}
</script>

<style lang="scss">
.color-picker__trigger {
  display: inline-block;
  box-sizing: border-box;
  height: 40px;
  width: 40px;
  padding: 4px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 0;
  position: relative;
  cursor: pointer;
}

.color-picker__color {
  position: relative;
  display: block;
  box-sizing: border-box;
  border: 1px solid #999;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  text-align: center;
}

.color-picker__color-inner {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>