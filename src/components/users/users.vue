<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片实图区域-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!--表格区域-->
    <template>
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe
        table="#">
        <el-table-column type="index"></el-table-column>

        <el-table-column prop="username"  label="姓名" ></el-table-column>

        <el-table-column prop="email"  label="邮箱" ></el-table-column>

        <el-table-column prop="mobile"  label="电话"></el-table-column>

        <el-table-column prop="role_name" label="角色" ></el-table-column>

        <el-table-column label="状态" >
          <template slot-scope="scope">
            <el-switch @change="userStatusChanged(scope.row)"
              v-model="scope.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column  label="操作" width="300px" >
          <template slot-scope="scope">
            <!--修改-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
                         @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--添加用户-->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        @close="addDialogClosed"
        width="30%">
        <el-form ref="addFormRef" status-icon :rules="addFormRules" :model="addForm" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </el-dialog>
      <!--修改用户-->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">

        <el-form ref="editFormRef" status-icon  :model="editForm" :rules="editFormRules" label-width="80px">

          <el-form-item label="用户名">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>

          <el-form-item label="电话" prop="mobile" >
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>

        </el-form>

        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>

      </el-dialog>
      <!--分配用户角色-->
      <el-dialog class="userRole"
        title="分配角色" :visible.sync="setRoleDialogVisible"  @close="setRoleDialogClosed"  width="50%">
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
              <el-select v-model="selectedRoleId" clearable  placeholder="请选择">
                <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
              </el-select>
        </p>
        <p class="buttom">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </p>
      </el-dialog>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'users',
    data () {
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的邮箱'))
      }
      var checkMoblie = (rule, value, callback) => {
        const regMoblie = /^[1][3,4,5,7,8][0-9]{9}$/
        if (regMoblie.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号'));
      }
      return {
        //获取用户列表参数对象
        queryInfo: {
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示数据条数
          pagesize: 2
        },
        userList: [],
        total: 0,
        dialogVisible: false,
        //添加用户
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 1, max: 6, message: '用户名的长度在2-5个字符之间', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 1, max: 6, message: '用户名的长度在2-5个字符之间', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMoblie, trigger: 'blur' }
          ]
        },
        editDialogVisible: false,
        //查询到的用户对象
        editForm: {},
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMoblie, trigger: 'blur' }
          ]
        },
        setRoleDialogVisible: false,
        userInfo:{},
        selectedRoleId:'',
        rolesList: []
      }
    },
    //初始化
    created () {
      this.getUserList()
    },
    methods: {
      //获取用户列表
      async getUserList () {
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
      },
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //页码值改变
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //修改用户状态
      async userStatusChanged (userInfo) {
        console.log(userInfo)
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败')
        } else {
          this.$message.success('用户状态更新成功')
        }
      },
      //关闭添加用户区域
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      //添加用户
      addUser () {
        this.$refs.addFormRef.validate(async vaild => {
          console.log(vaild)
          if (!vaild) return
          const { data: res } = await this.$http.post('users', this.addForm)
          console.log(res)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败！')
          } else {
            this.$message.success('添加用户成功！')
            this.dialogVisible = false
            this.getUserList()
          }
        })
      },
      //展示编辑修改用户
      async showEditDialog (id) {
        this.editDialogVisible = true
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data
        console.log(this.editForm)
      },
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo () {
        this.$refs.editFormRef.validate(async vaild => {
          if (!vaild) return
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('添加用户失败！')
          } else {
            this.$message.success('添加用户成功！')
            this.editDialogVisible = false
            this.getUserList()
          }
        })
      },
      //删除用户
      async removeUserById (id) {
        const confirmResult = await  this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        console.log(confirmResult)
        //确认为confirm 取消为cance
         if(confirmResult !== 'confirm'){
            this.$message.info('已取消删除')
         }
       const { data: res } = await this.$http.delete('users/'+id)
        if (res.meta.status !== 200) {
          this.$message.error('删除用户失败！')
        } else {
          this.$message.success('删除用户成功！')
          this.getUserList()
        }
      },
      //分配用户角色
      async setRole(userInfo) {
        this.setRoleDialogVisible = true
        this.userInfo = userInfo
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo(){
        this.setRoleDialogVisible =true
        console.log(this.selectedRoleId)
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('分配角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      //关闭角色分配框
      setRoleDialogClosed(){
        this.selectedRoleId = ''
        this.userInfo = {}

      }
    }
  }

</script>

<style lang="less" scoped>
  .userRole {
    text-align : left;
  }
  .buttom {
    text-align: right;
  }

</style>
