<template>
  <div class="color-svpanel"
       :style="{backgroundColor:background}"
       @click="handleClick">
    <div class="color-svpanel__white"></div>
    <div class="color-svpanel__black"></div>
    <div class="color-svpanel__cursor"
         :style="{
         top: cursorTop+'px',
         left: cursorLeft+'px'
       }">
      <div class="color-svpanel__cursor-icon"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    color: {
      required: true
    }
  },
  computed: {
    colorValue() {
      const hue = this.color.get('hue')
      const value = this.color.get('value')

      return { value, hue }
    }
  },
  watch: {
    colorValue() {
      this.update()
    }
  },
  data() {
    return {
      background: 'hsl(0, 100%, 50%)',
      cursorTop: 0,
      cursorLeft: 0
    }
  },
  methods: {
    /**
     * 根据颜色值设置取色器背景色和选中位置
     * 根据色调设置取色器背景色
     */
    update() {
      const saturation = this.color.get('saturation')
      const value = this.color.get('value')

      const el = this.$el
      let { clientWidth: width, clientHeight: height } = el

      this.cursorLeft = (saturation * width) / 100
      this.cursorTop = ((100 - value) * height) / 100

      this.background = 'hsl(' + this.color.get('hue') + ', 100%, 50%)'
    },
    /**
     * 根据选中位置设置颜色值
     */
    handleClick(evt) {
      const el = this.$el
      const rect = el.getBoundingClientRect()

      let left = evt.clientX - rect.left
      let top = evt.clientY - rect.top
      left = Math.max(0, left)
      left = Math.min(left, rect.width)

      top = Math.max(0, top)
      top = Math.min(top, rect.height)

      this.cursorLeft = left
      this.cursorTop = top
      this.color.set({
        saturation: (left / rect.width) * 100,
        value: 100 - (top / rect.height) * 100
      })
    }
  }
}
</script>

<style lang="scss">
.color-svpanel {
  position: relative;
  width: 300px;
  height: 300px;
}

.color-svpanel__cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 3px;
}

.color-svpanel__cursor-icon {
  width: 4px;
  height: 4px;
  box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, 0.3),
    0 0 1px 2px rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  transform: translate(-2px, -2px);
}

.color-svpanel__white {
  background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
}

.color-svpanel__white,
.color-svpanel__black {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.color-svpanel__black {
  background: linear-gradient(0deg, #000, transparent);
}
</style>