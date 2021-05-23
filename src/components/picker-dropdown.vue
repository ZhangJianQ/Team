<template>
  <div class="color-picker-dropdown"
       v-show="showPopper">
    <div class="color-dropdown__main">
      <hue-slider :color="color"
                  style="float:right"></hue-slider>
      <sv-panel :color="color"></sv-panel>
    </div>
    <!-- <alpha-slider v-show="showAlpha"
                  :color="color"></alpha-slider> -->
    <div class="color-dropdown__buttons">
      <span class="color-dropdown__value">
        <input type="text"
               v-model="customInput">
      </span>
      <button @click="confirmValue">确认</button>
    </div>
  </div>
</template>

<script>
import SvPanel from './sv-panel'
import HueSlider from './hue-slider'
// import AlphaSlider from './alpha-slider'
export default {
  components: {
    SvPanel,
    HueSlider
    // AlphaSlider
  },
  data() {
    return {
      customInput: ''
    }
  },
  props: {
    value: Boolean,
    color: {
      required: true
    },
    showAlpha: Boolean
  },
  computed: {
    currentColor() {
      const parent = this.$parent
      return !parent.value && !parent.showPanelColor ? '' : parent.color.value
    },
    showPopper() {
      return this.value
    }
  },
  mounted() {
    this.referenceElm = this.$parent.$el
    this.$parent.popperElm = this.popperElm = this.$el
  },
  methods: {
    confirmValue() {
      this.$emit('pick')
    }
  },
  watch: {
    currentColor: {
      immediate: true,
      handler(val) {
        this.customInput = val
      }
    }
  }
}
</script>

<style lang="scss">
.color-picker-dropdown {
  width: 340px;
}
</style>
