<script>
import Upload from './upload.vue'
import Progress from './progress.vue'
function noop() {}

export default {
  name: 'Uploader',
  components: {
    Progress,
    Upload
  },
  provide() {
    return {
      uploader: this
    }
  },
  inject: {
    Form: {
      default: ''
    }
  },
  props: {
    action: {
      type: String,
      required: true
    },
    headers: {
      type: Object,
      default() {
        return {}
      }
    },
    data: Object,
    multiple: Boolean,
    name: {
      type: String,
      default: 'file'
    },
    drag: Boolean,
    dragger: Boolean,
    withCredetials: Boolean,
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: String,
    type: {
      type: String,
      default: 'select'
    },
    beforeUpload: Function,
    beforeRemove: Function,
    onRemove: {
      type: Function,
      default: noop
    },
    onChange: {
      type: Function,
      default: noop
    },
    onPreview: {
      type: Function,
      default: noop
    },
    onSuccess: {
      type: Function,
      default: noop
    },
    onProgress: {
      type: Function,
      default: noop
    },
    onError: {
      type: Function,
      default: noop
    },
    fileList: {
      type: Array,
      default() {
        return []
      }
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'text'
    },
    httpRequest: Function,
    disabled: Boolean,
    limit: Number,
    onExceed: {
      type: Function,
      default: noop
    }
  },
  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1
    }
  },
  computed: {
    uploadDisabled() {
      return this.disabled || (this.Form || {}).disabled
    }
  },
  watch: {
    listType(type) {
      if (type === 'picture-card' || type === 'picture') {
        this.uploadFiles = this.uploadFiles.map(file => {
          if (!file.url && file.raw) {
            try {
              file.url = URL.createObjectURL(file.raw)
            } catch (err) {
              console.error('[Uploader]', err)
            }
          }
          return file
        })
      }
    },
    fileList: {
      immediate: true,
      handler(fileList) {
        this.uploadFiles = fileList.map(item => {
          item.uid = item.uid || Date.now() + this.tempIndex++
          item.status = item.status || 'success'
          return item
        })
      }
    }
  },
  methods: {
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++
      let file = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile
      }

      if (this.listType === 'picture-card' || this.listType === 'picture') {
        try {
          file.url = URL.createObjectURL(rawFile)
        } catch (err) {
          console.error('[Uplader]', err)
          return
        }
      }

      this.uploadFiles.push(file)
      this.onChange(file, this.uploadFiles)
    },
    handleProgress(evt, rawFile) {
      const file = this.getFile(rawFile)
      this.onProgress(evt, file, this.uploadFiles)
      file.status = 'progress'
      file.percentage = evt.percent || 0
    },
    handleSuccess(res, rawFile) {
      const file = this.getFile(rawFile)
      if (file) {
        file.status === 'success'
        file.response = res

        this.onSuccess(res, file, this.uploadFiles)
        this.onChange(file, this.uploadFiles)
      }
    },
    handleError(err, rawFile) {
      const file = this.getFile(rawFile)
      const fileList = this.uploadFiles

      file.status = 'fail'
      fileList.splice(fileList.indexOf(file), 1)
      this.onError(err, file, this.uploadFiles)
      this.onChange(file, this.uploadFiles)
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw)
      }
      let doRemove = () => {
        let fileList = this.uploadFiles

        this.abort(file)
        fileList.splice(fileList.indexOf(file), 1)
        this.onRemove(file, fileList)
      }

      if (!this.beforeRemove) {
        doRemove()
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles)
        if (before && before.then) {
          before.then(() => {
            doRemove()
          }, noop)
        } else if (before !== false) {
          doRemove()
        }
      }
    },
    getFile(rawFile) {
      let fileList = this.uploadFiles
      let target
      // 用 every 可以在返回 false 时立即中止循环执行
      fileList.every(item => {
        target = rawFile.uid === item.uid ? item : null
        return !target
      })
      return target
    },
    abort(file) {
      this.$refs['upload-inner'].abort()
    },
    clearFiles() {
      this.uploadFiles = []
    },
    submit() {
      this.uploadFiles
        .filter(file => file.status === 'ready')
        .forEach(file => {
          this.$refs['upload-inner'].upload(file.raw)
        })
    }
  },
  beforeDestroy() {
    this.uploadFiles.forEach(file => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.createObjectURL(file.url)
      }
    })
  },
  render(h) {
    const props = {
      props: {
        type: this.type,
        drag: this.drag,
        action: this.action,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredetials,
        headers: this.headers,
        name: this.name,
        data: this.data,
        accept: this.accept,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.uploadDisabled,
        limit: this.limit,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'http-request': this.httpRequest
      },
      ref: 'upload-inner'
    }
    const trigger = this.$slots.trigger || this.$slots.default
    const uploadComponent = <upload {...props}>{trigger}</upload>

    return (
      <div>
        {this.$slots.trigger
          ? [uploadComponent, this.$slots.default]
          : uploadComponent}
        {this.$slots.tip}
      </div>
    )
  }
}
</script>