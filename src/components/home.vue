<template>
  <el-container class="home-container">
    <!--头-->
    <el-header>
      <div>
        <img class="avator" src="../assets/avator.png" alt="">
        <span>电商管理后台系统</span>
      </div>
      <el-button type="info" @click="loginOut()">退出</el-button>
    </el-header>

    <el-container>
      <el-aside :width ="isCollapse ? '64px':'200px'">
        <!--侧边栏菜单区域-->
        <div class="toggle-button" @click="toggleCollapse">
          $$$
        </div>

        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id +''" v-for="item in menusList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span> {{ item.authName}} </span>
            </template>
          <!--二级菜单-->
              <el-menu-item @click="saveNavState('/'+subItem.path)" :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'home',
    data() {
      return {
        menusList: [],
        iconsObj: {
          '125':'iconfont icon-icon_users',
          '103':'iconfont icon-quanxian',
          '101':'iconfont icon-shangpin',
          '102':'iconfont icon-icon-',
          '145':'iconfont icon-shuju'
        },
        isCollapse: false,
        //为激活链接地址
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      loginOut() {
        window.sessionStorage.clear();
        this.$router.push('/login')
      },
      async getMenuList() {
        const { data : res } = await this.$http.get('menus')
        if(res.meta.status !== 200)return this.$message.error(res.meta.msg)
        console.log(res.data)
        this.menusList = res.data
      },
      //菜单的折叠和展开
      toggleCollapse (){
        this.isCollapse =!this.isCollapse
      },
      //保存链接激活状态
      saveNavState (activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    padding: 0;
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #EAEDF1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    /*文字之间de间距*/
    letter-spacing: 0.2em;
    /*鼠标变小手*/
    cursor: pointer;
  }
  .avator {
    border-radius: 50%;
  }
</style>
