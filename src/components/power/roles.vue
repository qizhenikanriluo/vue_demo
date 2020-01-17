<template>
  <div>
  <!--面包屑导航区-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片区域-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row :gutter="20">
        <el-col :span="2">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--stripe隔行变色-->
      <el-table :data="roleList" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
          <!-- 格式化文本<pre>{{scope.row}}}</pre>-->
            <el-row  :class="['bdbottom', i1 === 0 ?' bdtop':'','vcenter']" v-for="(item, i1) in scope.row.children" :key="item.id" >
              <!--一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级和三级权限-->
              <el-col :span="19" >
                <!--二级权限-->
                <el-row :class="[ i2 ===0 ? '':'dbtop','vcenter']" v-for="(item1, i2) in item.children" :key="item1.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row,item1.id)" type="success">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag  type="warning" v-for="(item2, i3) in item1.children" :key="item2.id" closable @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column  label="操作">
          <template slot-scope="scope">
            <!--修改-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!--删除-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)">删除</el-button>
            <!--分配角色-->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
                         @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
    <!--分配权限对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree ref="treeRef" :data="rightList" :props="treeProps" show-checkbox node-key="id"
                default-expand-all
               :default-checked-keys="defKeys"></el-tree>
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="allotRights">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'roles',
    data() {
      return {
        roleList:[],
        //权限对话框隐藏显示
        setRightDialogVisible :false,
        rightList: [],
        //树形控件
        treeProps: {
          label : 'authName',
          children: 'children'
        },
        //默认选中的值
        defKeys: [],
        //即将分配权限的ID
        roleId: ''
      }
    },
    created () {
      this.getRoulesList()
    },
    methods: {
      async getRoulesList(){
        const { data: res } =  await this.$http.get('roles')
        if(res.meta.status !== 200) this.$message.error('获取用户列表失败')
        this.roleList = res.data
      },
      //根绝ID删除对应权限
       async removeRightById(role,rightId){
        //弹框提示用户是否删除
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
           confirmButtonText: '确定',
           cancelButtonText: '取消',
           type: 'warning'
         }).catch(err => err)
         if(confirmResult !== 'confirm'){
          return this.$message.info('用户取消删除')
         }
        const { data: res }  = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
         if(res.meta.status !== 200) return this.message.error('删除权限失败')
         //不建议调用会引起全局刷新
         //this.getRoulesList()
         role.children = res.data;

      },
      //展示分配权限对话框
     async showSetRightDialog(role){
        this.roleId = role.id
        //获取所有权限数据
        const { data: res } = await this.$http.get('rights/tree')
        if(res.meta.status !== 200) return this.$message.error('获取用户权限失败')
        this.rightList = res.data
       this.getLeafKyes(role,this.defKeys)
       this.setRightDialogVisible = true
      },
      //获取三级节点
      getLeafKyes(node,arr){
        //如果当前node节点不包含chukdren,则是三级节点
        if(!node.children){
          return arr.push(node.id)
        }
        node.children.forEach(item =>this.getLeafKyes(item,arr))
      },
      //监听分配权限对话框
      setRightDialogClosed(){
        this.defKeys = []
      },
      //为角色分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const { data: res } =  await this.$http.post(`roles/${this.roleId}/rights`,{ rids: idStr })
        console.log(res)
        if(res.meta.status !== 200) return this.$message.error('分配用户权限失败')
        this.$message.success('分配用户权限成功！')
        this.getRoulesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bdtop{
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }


</style>
