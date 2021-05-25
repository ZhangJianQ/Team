<template>
  <div class="image">
    <slot v-if="loading" name="placeholder">
      <div class="image__placeholder"></div>
    </slot>
    <slot v-else-if="error" name="error">
      <div class="image_error">{{ t('el.image.error') }}</div>
    </slot>
    <img
      v-else
      class="image__inner"
      :src="src"
      v-bind="$attrs"
      v-on="$listeners"
      @click="clickHandler"
      :style="imageStyle"
      :class="{ 'image__inner--center': alignCenter, 'image-preview': preview }"
    />
    <template v-if="preview">
      <!--  -->
    </template>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce'
import { on, off, isInContainer, getStyle } from '@/utils/dom'
let bodyPrevOverflowValue = ''
export default {
  name: 'ElImage',
  inheritAttrs: false,
  props: {
    src: String,
    lazy: Boolean,
    fit: String,
    scrollContainer: {},
    perviewSrcList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      loading: true, // 懒加载时先显示点位
      error: false,
      show: !this.lazy, // 控制加载图片
      imageWidth: 0,
      imageHeight: 0,
      showViewer: false
    }
  },
  computed: {
    imageStyle() {
      const { fit } = this
      if (fit) {
        return { 'object-fit': fit }
      }
      return {}
    },
    alignCenter() {
      return true
    },
    preview() {
      const { perviewSrcList } = this
      return Array.isArray(perviewSrcList) && perviewSrcList.length > 0
    }
  },
  watch: {
    src() {
      this.show && this.loadImage()
    },
    show(val) {
      val && this.loadImage()
    }
  },
  mounted() {
    if (this.lazy) {
      this.addLazyLoadListener()
    } else {
      this.loadImage()
    }
  },
  beforeDestroy() {
    this.lazy && this.removeLazyLoadListener()
  },
  methods: {
    /**
     * 执行图片加载
     */
    loadImage() {
      var image = new Image()

      this.loading = true
      this.error = false
      image.onload = e => this.handleLoad(e, image)
      image.onerror = this.handleError.bind(this)

      Object.keys(this.$attrs).forEach(key => {
        const value = this.$attrs[key]
        image.setAttribute(key, value)
      })
      image.src = this.src
    },
    handleLoad(image) {
      this.imageWidth = image.width
      this.imageHeight = image.height
      this.loading = this.error = false
    },
    handleError(evt) {
      this.loading = false
      this.error = true
      this.$emit('error', evt)
    },
    /**
     * 图片加载的契机，判断是否要加载图片
     */
    handleLazyLoad() {
      if (isInContainer(this.$el, this._scrollContainer)) {
        this.show = true // 这里控制图片的加载
        this.removeLazyLoadListener()
      }
    },
    /**
     * 注册懒加载事件
     */
    addLazyLoadListener() {
      const parentNode = this.$parent.$el
      if (['auto', 'scroll'].indexOf(getStyle(parentNode, 'overflow')) > -1) {
        this._scrollContainer = parentNode
        this._lazyLoadHandler = throttle(200, this.handleLazyLoad)
        on(this._scrollContainer, 'scroll', this._lazyLoadHandler)
        this.handleLazyLoad()
      }
    },
    removeLazyLoadListener() {
      const { _scrollContainer, _lazyLoadHandler } = this

      off(_scrollContainer, 'scroll', _lazyLoadHandler)
      this._scrollContainer = null
      this._lazyLoadHandler = null
    },
    getImageStyle() {},
    clickHandler() {
      if (!this.preview) {
        return
      }

      bodyPrevOverflowValue = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      this.showViewer = true
    },
    closeViewer() {
      document.body.style.overflow = bodyPrevOverflowValue
      this.showViewer = false
    }
  }
}
</script>

<style lang="scss">
.image__inner {
  width: 100%;
  height: 100%;
}

.image {
  min-height: 200px;
}
</style>