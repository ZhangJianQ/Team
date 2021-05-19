class EndWebpackPlugin {
  constructor(doneCallback, failCallback) {
    this.doneCallback = doneCallback
    this.failCallback = failCallback
  }

  apply(compiler) {
    // 监听webpack生命周期里的事件，做相应的处理
    compiler.plugin('done', stats => {
      this.doneCallback(stats)
    })
    compiler.plugin('failed', err => {
      this.failCallback(err)
    })
  }
}

module.exports = EndWebpackPlugin
