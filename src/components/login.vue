<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区-->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--表单登陆区域-->
      <el-form ref="loginFormRef" :rules="loginFormRules"  :model="loginForm" label-width="0px" class="login_form" >
        <!--用户名-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-yonghu"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-mima" type="password"></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login()">登陆</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return
        }
      const { data :res } =  await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        //1、登陆成功后保存tooken 保存在 sessionStorage
        //2、跳转到后台zhuye主页
        window.sessionStorage.setItem('token',res.data.token)
        this.$router.push('/home')
      })
    },
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    /*添加圆角边框*/
    border-radius: 3px;
    /*绝对定位*/
    position: absolute;
    top: 50%;
    left: 50%;
    /*ranslate(x,y)定义2D 转换*/
    transform: translate(-50%, -50%);
    .avater_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      /*设置图片自身的位置*/
      position: absolute;
      left: 50%;
      /*减去自身距离1、x轴2、y轴*/
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .login_form {
   position: absolute;
   bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    /*justify-content : flex-end;元素在主轴（页面）上由右或者下开始排列*/
    justify-content: flex-end;
  }

</style>
