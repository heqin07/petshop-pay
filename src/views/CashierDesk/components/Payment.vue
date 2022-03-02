<template>
  <div class="desk-payment">
    <!--支付-->
    <div
      v-if="step === 1"
      class="payment-step1"
    >
      <el-row class="tab">
        <el-radio-group
          v-model="type"
          @change="handleSlectPayment()"
        >
          <el-radio-button
            v-for="i in typeList"
            :key="i.id"
            :label="i.name"
          >
            {{ i.name }}
          </el-radio-button>
        </el-radio-group>
      </el-row>
      <el-row class="total">
        <span>应收金额：</span>
        <span>￥{{ getRest }}</span>
      </el-row>
      <!--挂账直接付全款，需要先选择挂账客户-->
      <div v-if="type === '挂账'">
        <el-row class="input">
          <el-form
            ref="form"
            :model="form"
            :rules="formRule"
            @submit.native.prevent
          >
            <el-form-item
              label=""
              prop="phone"
            >
              <el-input
                :key="1"
                v-model="form.phone"
                placeholder="请输入完整手机号查找挂账客户"
                class="el-input"
              />
            </el-form-item>
          </el-form>
        </el-row>
        <el-row
          class="key-board"
          style="margin-top: 50px"
        >
          <KeyBoard
            v-model="form.phone"
            :is-telephone="true"
            :width="500"
            @submit="hanldeSearchCustomer"
          />
        </el-row>
      </div>
      <div v-else>
        <el-row class="input">
          <el-form
            ref="form"
            :model="form"
            :rules="formRule"
          >
            <el-form-item
              label=""
              prop="actualPrice"
            >
              <el-input
                :key="2"
                v-model="form.actualPrice"
                v-input-limit="{ min: 0, max: 9999999, precision: 2 }"
                placeholder="请输入实收金额"
                class="el-input"
              />
            </el-form-item>
          </el-form>
        </el-row>
        <el-row class="rest">
          <div v-if="type=='现金'">
            <span>找零：</span>
            <span>￥{{ getChangeBefore }}</span>
          </div>
        </el-row>
        <el-row class="key-board">
          <KeyBoard
            v-model="form.actualPrice"
            :total="getRest"
            :width="500"
            @submit="handlePay"
          />
        </el-row>
      </div>
    </div>
    <!--选择组合支付类型-->
    <div
      v-else-if="step === 2"
      class="payment-step2"
    >
      <!--挂账-->
      <template v-if="type === '挂账'">
        <el-row class="header">
          <i
            class="el-icon-close close"
            @click="handleClose"
          />
        </el-row>
        <el-row class="total">
          <span>挂账金额：</span>
          <span>￥{{ getRest }}</span>
        </el-row>
        <el-row class="customer">
          <span>请与客户确定以下挂账信息</span>
          <!--客户卡片-->
          <div
            v-for="(i, index) in customerList"
            :key="index"
            class="user-card"
          >
            <img
              v-if="avatar"
              :src="avatar"
              class="logo"
            >
            <span>{{ i.name || '' }}</span>
            <span>{{ i.defaultContactPhone || encryptPhone }}</span>
          </div>
        </el-row>
      </template>
      <template v-else>
        <el-row class="header">
          <!-- <i class="el-icon-close close" @click="handleClose" /> -->
        </el-row>
        <el-row class="title">
          请选择以下任意方式继续收款
        </el-row>
        <el-row class="price-info">
          <span>应收金额：<span>￥{{ getSummary }}</span></span>
          <span>已收金额：<span>￥{{ getReceived }}</span></span>
          <span>还需收款：<span>￥{{ getRest }}</span></span>
        </el-row>
        <el-row class="footer">
          <el-button
            v-for="i in typeList"
            :key="i.id"
            class="btn"
            @click="handleSelectCombination(i.name)"
          >
            {{ i.name }}
          </el-button>
        </el-row>
      </template>
    </div>
    <!--支付成功-->
    <div
      v-else-if="step === 3"
      class="payment-step3"
    >
      <el-row
        class="title"
        :style="type === '挂账' ? 'padding-top: 310px' : 'padding-top: 50px'"
      >
        {{ type === '挂账' ? '挂账成功' : '结算成功' }}
      </el-row>
      <el-row class="icon">
        <img src="../../../assets/store/payment_success.png">
      </el-row>
      <el-row
        v-if="type !== '挂账'"
        class="payment-info"
      >
        <div class="item">
          <span>应收金额：</span>
          <span>￥{{ getSummary }}</span>
        </div>
        <div class="item">
          <span>优惠金额：</span>
          <span>￥{{ cart.reduceValue || 0 }}</span>
        </div>
        <div class="item">
          <span>实付金额：</span>
          <span class="red">￥{{ getReceived }}</span>
        </div>
        <div
          v-if="getChange"
          class="item"
        >
          <span>找零金额：</span>
          <span>￥{{ getChange }}</span>
        </div>
        <div
          v-if="payStep && payStep.length"
          class="item"
        >
          <span>收款方式：</span>
          <div class="pay-detail">
            <span
              v-for="(i, index) in payStep"
              :key="index"
            >{{ i.paymentName }} ￥{{ i.pay }}</span>
          </div>
        </div>
      </el-row>
    </div>
    <div class="footer-btn">
      <el-button
        v-if="step === 1"
        @click="handleCancelPay"
      >取消收款</el-button>
      <template v-if="type === '挂账'">
        <el-button
          v-if="step === 2"
          @click="handleCancelPay"
        >取消收款</el-button>
        <el-button
          v-if="step === 2"
          class="active-btn"
          @click="handleCertainBuy"
        >确认挂账</el-button>
      </template>
      <el-button
        v-if="step === 3"
        @click="handleReturnDesk"
      >返回收银台</el-button>
    </div>
    <!--结算成功打印小票-->
    <!-- <print
      v-if="printVisible"
      :id="orderId"
      :visible.sync="printVisible"
      :type="1"
    /> -->
  </div>
</template>

<script>
import KeyBoard from './KeyBoard/index.vue'
// import print from '../../Order/components/Print'
import { mapGetters } from 'vuex'
export default {
  components: {
    KeyBoard,
    print
  },
  props: {
    openCustom: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validatePhone = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (value.trim().length !== 11) {
        callback(new Error('手机号格式有误，请检查后重试'))
      } else {
        callback()
      }
    }
    return {
      step: 1,
      type: '',
      form: {
        actualPrice: '', // 实收金额
        phone: '', // 挂账客户手机号搜索
        paymentId: '', // 支付方式ID
        paymentName: '' // 支付方式名称
      },
      payStep: [],
      typeList: [],
      customerList: [], // 挂账客户数据
      printVisible: false,
      orderId: '',
      paySuccess: false, // 支付成功标志
      formRule: {
        'phone': [
          { validator: validatePhone, trigger: 'blur' }
        ],
        'actualPrice': [
          { required: true, message: '请输入应收金额', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // ...mapGetters(['avatar', 'cart', 'settle', 'userInfo']),
    ...mapGetters(['avatar', 'cart', 'settle']),
    // 应付金额
    getSummary() {
      return Number(this.settle && this.settle.paymentAmount)
    },
    // 找零金额, 提交之前
    getChangeBefore() {
      let change = 0
      if (+this.form.actualPrice > this.getRest) {
        change = Number(this.form.actualPrice).toFixed(2) - this.getRest
      }
      return +change.toFixed(2)
    },
    // 找零金额, 提交之后
    getChange() {
      let change = 0
      if (+this.getReceived > +this.getSummary) {
        change = +this.getReceived - +this.getSummary
      }
      return +change.toFixed(2)
    },
    // 已收款金额
    getReceived() {
      let price = 0
      this.payStep.forEach(i => {
        price += Number(i.pay)
      })
      return price
    },
    // 待付款金额
    getRest() {
      const rest = (this.getSummary - this.getReceived).toFixed(2)
      return Number(rest)
    }
  },
  created() {
    // 结算时支付金额为0，直接跳转到支付成功页面
    if (this.settle.status === 4) {
      this.orderId = this.settle.id
      this.step = 3
      this.printVisible = true
    } else {
      this.getPayMethods()
    }
  },
  destroyed() {
    if (this.paySuccess) {
      this.$store.commit('cart/SET_CART_DATA', {})
    }
  },
  methods: {
    handleSlectPayment() {
      const obj = this.typeList.find(i => i.name === this.type)
      this.form.paymentId = obj.id
      this.form.paymentName = obj.name
    },
    handlePay() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 需在数据push进payStep提前计算待支付金额
          let rest = 0
          this.payStep.forEach(i => {
            rest += Number(i.pay)
          })
          const { actualPrice, paymentId, paymentName } = this.form
          this.$http.post(this.$api.payOrder, {
            amount: actualPrice,
            orderId: this.settle.id,
            paymentId,
            paymentName
          }).then((res) => {
            const status = res.data && res.data.status
            this.payStep = res.data && res.data.payments || []
            // 一次未付完，继续组合支付
            if ((this.getSummary - rest) > +actualPrice && status !== 4) {
              const idx = this.typeList
                .findIndex(i => i.name === this.type)
              this.typeList.splice(idx, 1)
              this.typeList = this.typeList.filter(i => i.name !== '挂账')
              this.step += 1
            } else {
              this.$store.commit('cart/SET_SETTLE_DATA', res.data || {})
              this.orderId = res.data && res.data.id
              this.step = 3
              this.printVisible = true
              this.paySuccess = true
            }
          })
        }
      })
    },
    // 挂账收款，一次付完，不能组合
    handleCertainBuy() {
      this.form.actualPrice = this.getRest
      const { actualPrice, paymentId, paymentName } = this.form
      const { id } = this.customerList[0]
      this.$http.post(this.$api.payOrder, {
        amount: actualPrice,
        orderId: this.settle.id,
        paymentId,
        paymentName,
        charge: {
          customerId: id
        }
      }).then((res) => {
        this.step++
        this.$store.commit('cart/SET_SETTLE_DATA', res.data || {})
        this.paySuccess = true
      })
    },
    // 选择组合支付类型
    handleSelectCombination(val) {
      this.type = val
      const obj = this.typeList.find(i => i.name === this.type)
      this.form.paymentId = obj.id
      this.form.paymentName = obj.name
      this.step -= 1
    },
    // 获取支付方式
    getPayMethods() {
      return this.$http.get(this.$api.getPayMethods)
        .then((res) => {
          this.typeList = res.data || []
          if (this.typeList.length) {
            // 部分支付，数据回显，过滤已支付方式
            if (this.settle && this.settle.payments) {
              this.payStep = this.settle.payments
              const paymethodsList = []
              this.payStep.forEach(i => {
                paymethodsList.push(i.paymentName)
              })
              if (paymethodsList.length) {
                this.typeList = this.typeList.filter(j => !paymethodsList.includes(j.name))
                this.typeList = this.typeList.filter(i => i.name !== '挂账')
              }
            }
            this.type = this.typeList[0].name
            this.form.paymentId = this.typeList[0].id
            this.form.paymentName = this.typeList[0].name
          }
        })
    },
    hanldeSearchCustomer() {
      if (!this.form.phone || this.form.phone.trim().length !== 11) return
      const params = {
        contactPhone: this.form.phone,
        // orgId: this.userInfo.user.orgId || '',
        settlementCycleType: 2
      }
      this.$http.post(this.$api.getCustomerList, params)
        .then((res) => {
          this.customerList = res.data.rows && res.data.rows.splice(0, 1) || []
          if (!this.customerList.length) {
            this.$confirm('挂账客户不存在，如有需要请在R1系统中创建', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
          } else {
            this.step += 1
          }
        })
    },
    // 取消收款
    handleCancelPay() {
      this.$emit('update:visible', false)
      this.$store.commit('cart/SET_SETTLE_DATA', {})
    },
    handleClose() {
      this.step -= 1
    },
    // 结算成功，返回收银台
    handleReturnDesk() {
      this.$emit('update:openCustom', false)
      this.$store.commit('cart/RESET_CART')
      this.$store.commit('cart/SET_SETTLE_DATA', {})
    }
  }
}
</script>

<style lang="less" scoped>
.desk-payment {
  min-height: calc(100vh - 88px);
  background: #fff;
  .payment-step1 {
    min-height: calc(100vh - 180px);
    .tab {
      display: flex;
      justify-content: center;
      padding-top: 20px;
    }
    .total {
      text-align: center;
      padding: 50px;
      span:first-child {
        color: #272727;
        font-size: 20px;
        font-weight: 600;
      }
      span:last-child {
        color: #df273e;
        font-size: 24px;
        font-weight: 600;
      }
    }
    .input {
      display: flex;
      justify-content: center;
      .el-input {
        width: 480px;
        height: 60px;
        input {
          height: 60px;
        }
      }
    }
    .rest {
      padding: 20px;
      display: flex;
      justify-content: center;
      div {
        text-align: right;
        width: 480px;
        span:first-child {
          color: #5a5a5a;
          font-size: 18px;
        }
        span:last-child {
          color: #e2384d;
          font-size: 18px;
        }
      }
    }
    .key-board {
      display: flex;
      justify-content: center;
    }
  }
  .payment-step2 {
    min-height: calc(100vh - 180px);
    .header {
      text-align: right;
      padding: 20px;
      .close {
        font-size: 24px;
        padding: 10px;
        font-weight: 600;
        color: #ff6f2a;
        cursor: pointer;
      }
    }
    .title {
      text-align: center;
      font-size: 28px;
      font-weight: 600;
      color: #323232;
    }
    .price-info {
      padding: 40px 50px;
      display: flex;
      justify-content: space-around;
      span {
        font-size: 18px;
        span {
          font-size: 20px;
        }
        &:nth-child(3) {
          span {
            color: #df273e;
          }
        }
      }
    }
    .footer {
      display: flex;
      justify-content: space-around;
      .btn {
        width: 140px;
        height: 50px;
      }
    }
    .total {
      text-align: center;
      padding: 50px;
      span:first-child {
        color: #272727;
        font-size: 20px;
        font-weight: 600;
      }
      span:last-child {
        color: #df273e;
        font-size: 24px;
        font-weight: 600;
      }
    }
    .customer {
      padding: 40px;
      span {
        font-size: 20px;
        color: #7d7d7d;
      }
      .user-card {
        margin-top: 20px;
        height: 100px;
        border: 1px solid #c1c1c1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-radius: 5px;
        img {
          width: 45px;
          height: 45px;
          border-radius: 45px;
        }
        span {
          font-size: 14px;
          color: #272727;
          &.btn {
            color: #ff8854;
            cursor: pointer;
          }
        }
      }
    }
  }
  .payment-step3 {
    min-height: calc(100vh - 180px);
    .title {
      padding-top: 50px;
      text-align: center;
      font-size: 28px;
      font-weight: 600;
      color: #323232;
    }
    .icon {
      padding: 20px;
      text-align: center;
      img {
        width: 40px;
        height: 40px;
      }
    }
    .payment-info {
      width: 80%;
      margin: 20px auto;
      .item {
        padding: 20px;
        display: flex;
        justify-content: space-between;
        font-size: 18px;
        span:first-child {
          min-width: 100px;
        }
        .red {
          color: #e4495c;
        }
        .pay-detail {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          flex-wrap: wrap;
          span {
            margin-left: 20px;
          }
        }
      }
    }
  }
  .footer-btn {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 30px 40px;
    border-top: 1px solid #d7d7d7;
  }
  ::v-deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    color: #fff;
    background-color: #ff6f2a;
    border-color: #ff6f2a;
    -webkit-box-shadow: -1px 0 0 0 #ff6f2a;
    box-shadow: -1px 0 0 0 #ff6f2a;
  }
  ::v-deep(.el-radio-button__inner) {
    border: 1px solid #ff6f2a;
    color: #ff6f2a;
    width: 120px;
    font-size: 14px;
  }
  ::v-deep(.el-input--small .el-input__inner) {
    height: 60px;
    line-height: 60px;
  }
}
</style>
