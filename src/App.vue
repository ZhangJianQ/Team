<template>
  <div id="app">
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
    >
      <el-form-item label="活动名称" prop="name">
        <input type="text" v-model="ruleForm.name" />
      </el-form-item>
      <el-form-item label="活动区域" prop="region">
        <select v-model="ruleForm.region" placeholder="请选择活动区域">
          <option label="区域一" value="shanghai"></option>
          <option label="区域二" value="beijing"></option>
        </select>
      </el-form-item>
      <el-form-item label="活动形式" prop="desc">
        <textarea type="textarea" v-model="ruleForm.desc"></textarea>
      </el-form-item>
      <el-form-item>
        <button type="button" @click="submitForm('ruleForm')">立即创建</button>
        <button type="button" @click="resetForm('ruleForm')">重置</button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ElForm from '@/components/form'
import ElFormItem from '@/components/form-item'
export default {
  components: {
    ElForm,
    ElFormItem
  },
  data() {
    return {
      ruleForm: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ],
        date1: [
          {
            type: 'date',
            required: true,
            message: '请选择日期',
            trigger: 'change'
          }
        ],
        date2: [
          {
            type: 'date',
            required: true,
            message: '请选择时间',
            trigger: 'change'
          }
        ],
        type: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个活动性质',
            trigger: 'change'
          }
        ],
        resource: [
          { required: true, message: '请选择活动资源', trigger: 'change' }
        ],
        desc: [{ required: true, message: '请填写活动形式', trigger: 'blur' }]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="stylus">
#app
  display block

.dark
  background-color orange
  color white
</style>