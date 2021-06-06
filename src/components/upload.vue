<script>
import ajax from './ajax'
import UploadDragger from './upload-dragger.vue'

export default {
  inject: ['uploader'],
  components: {
    UploadDragger
  },
  props: {
    type: String,
    action: {
      type: String,
      default: true
    },
    name: {
      type: String,
      default: 'file'
    },
    data: Object,
    headers: Object,
    withCredentials: Boolean,
    multiple: Boolean,
    accept: String,
    onStart: Function,
    onPregress: Function,
    onSuccess: Function,
    onError: Function,
    beforeUpload: Function,
    drag: Boolean,
    onPreview: {
      type: Function,
      default: function () {}
    },
    onRemove: {
      type: Function,
      default: function () {}
    },
    fileList: Array,
    autoUpload: Boolean,
    listType: String,
    httpRequest: {
      type: Function,
      default: ajax
    },
    disabled: Boolean,
    limit: Number,
    onExceed: Function
  },
  data() {
    return {
      mouseover: false,
      reqs: {}
    }
  },
  methods: {
    isImage(str) {
      return str.indexOf('image') !== -1
    },
    handleChange(e) {
      const files = e.target.files
      if (!files) return
      this.uploadFiles(files)
    },
    /**
     * 多文件处理
     */
    uploadFiles(files) {
      if (this.limit && this.fileList.length + files.length > this.limit) {
        this.onExceed && this.onExceed(files, this.fileList)
        return
      }

      let postFiles = Array.prototype.slice.call(files)
      if (!this.multiple) {
        postFiles = postFiles.slice(0, 1)
      }
      if (postFiles.length === 0) return

      // 多文件上传用的是一个一个上传，不是批量上传
      postFiles.forEach(rawFile => {
        this.onStart(rawFile)
        if (this.autoUpload) {
          this.upload(rawFile)
        }
      })
    },
    upload(rawFile) {
      this.$refs.input.value = null
      if (!this.beforeUpload) {
        return this.post(rawFile)
      }

      const before = this.beforeUpload(rawFile)
      if (before && before.then) {
        before.then(
          processedFile => {
            const fileType = Object.prototype.toString.call(processedFile)
            if (fileType === '[object File]' || fileType === '[object Blob]') {
              if (fileType === '[object Blob]') {
                processedFile = new File([processedFile], rawFile.name, {
                  type: rawFile.type
                })
              }
              for (let p in rawFile) {
                if (rawFile.hasOwnProperty(p)) {
                  processedFile[p] = rawFile[p]
                }
              }
              this.post(processedFile)
            } else {
              this.post(rawFile)
            }
          },
          () => {
            this.onRemove(null, rawFile)
          }
        )
      } else if (before !== false) {
        this.post(rawFile)
      } else {
        this.onRemove(null, rawFile)
      }
    },
    abort(file) {
      const { reqs } = this
      if (file) {
        let uid = file
        if (file.uid) {
          uid = file.uid
        }
        if (file[uid]) {
          reqs[uid].abort()
        }
      } else {
        Object.keys(reqs).forEach(uid => {
          if (reqs[uid]) {
            reqs[uid].abort()
          }
          delete reqs[uid]
        })
      }
    },
    post(rawFile) {
      const { uid } = rawFile
      const options = {
        headers: this.headers,
        withCredentials: this.withCredentials,
        file: rawFile,
        data: this.data,
        filename: this.name,
        action: this.action,
        onPregress: e => {
          this.onPregress(e, rawFile)
        },
        onSuccess: res => {
          this.onSuccess(res, rawFile)
          delete this.reqs[uid]
        },
        onError: err => {
          this.onError(err, rawFile)
          delete this.reqs[uid]
        }
      }
      const req = this.httpRequest(options)
      this.reqs[uid] = req
      if (req && req.then) {
        req.then(options.onSuccess, options.onError)
      }
    },
    handleClick(e) {
      if (!this.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
      }
    },
    handleKeydown(e) {
      if (e.target !== e.currentTarget) return
      // 按下回车键或空格键
      if (e.keyCode === 13 || e.keyCode === 32) {
        ths.handleClick()
      }
    }
  },
  render(h) {
    let {
      handleClick,
      drag,
      name,
      handleChange,
      multiple,
      accept,
      listType,
      uploadFiles,
      disabled,
      handleKeydown
    } = this
    const data = {
      class: {
        upload: true
      },
      on: {
        click: handleClick,
        keydown: handleKeydown
      }
    }
    data.class[`el-upload--${listType}`] = true
    return (
      <div {...data}>
        {drag ? (
          <upload-dragger disabled={disabled} on-file={uploadFiles}>
            {this.$slots.default}
          </upload-dragger>
        ) : (
          this.$slots.default
        )}
        <input
          type="file"
          ref="input"
          name={name}
          class="upload-input"
          on-change={handleChange}
          multiple={multiple}
          accept={accept}
        />
      </div>
    )
  }
}
</script>

<style lang="scss">
.upload-input {
  display: none;
}
</style>