<!--收银台模块-->
<template>
  <div class="cashier-desk">
    <el-row :gutter="4">
      <el-col :span="9">
        <!--购物车-->
        <cart
          v-if="!openFetch"
          @openPage="handleOpenPage"
        />
        <!-- @fetchGoods="$refs.goods.handleSearch('')" -->
        <!--取单页面-->
        <fetch-order
          v-else
          v-model:visible="openFetch"
          @fetchGoods="$refs.goods.handleSearch('')"
        />
        <!-- @fetchGoods="$refs.goods.handleSearch('')" -->
      </el-col>
      <el-col :span="15">
        <!--商品列表-->
        <goods
          v-model="openPayment"
          v-if="!openCustom && !openPayment && !selectSpecs && !openDiscount && !openDetail"
          ref="goods"
          v-bind:is-gift="isGift"
          @openPage="handleOpenPage"
        />
        <!--客户列表-->
        <select-custom
          v-if="openCustom"
          v-model:openCustom="openCustom"
        />
        <!--支付页面-->
        <payment
          v-if="openPayment"
          v-model:openCustom="openPayment"
        />
        <!-- 规格选择 -->
        <specs
          v-if="selectSpecs"
          v-model:visible="selectSpecs"
        />
        <!-- 整单优惠 -->
        <order-discount
          v-if="openDiscount"
          v-model:visible="openDiscount"
        />
        <!-- 优惠明细 -->
        <discount-detail
          v-if="openDetail"
          v-model:visible="openDetail"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import { ref, reactive } from 'vue'
import { api } from '../config';
import Goods from './Goods.vue'
import cart from './Cart.vue'
import SelectCustom from './components/SelectCustom.vue'
import FetchOrder from './components/FetchOrder.vue'
import Payment from './components/Payment.vue'
import Specs from './components/Specs.vue';
import OrderDiscount from './components/OrderDiscount.vue';
import DiscountDetail from './components/DiscountDetail.vue'
// import { mapGetters } from 'vuex'
export default {
  components: { Goods, cart, SelectCustom, FetchOrder, Payment, Specs, OrderDiscount, DiscountDetail },
  // setup() {
  //   let openCustom = ref(false) // 打开客户列表
  //   let openFetch = ref(false) // 打开取单列表
  //   let openPayment = ref(false) // 打开支付页面
  //   let isGift = ref(false)
  //   let selectSpecs = ref(false) //打开规格选择
  //   let openDiscount = ref(false)  //打开整单优惠
  //   let openDetail = ref(false)  //打开优惠明细


  //   // customer客户列表 fetchOrder挂单取单列表 payment支付列表 gift赠品列表
  //   let handleOpenPage = (val) => {
  //     if (val === 'customer') {
  //       openCustom.value = true
  //     } else if (val === 'fetchOrder') {
  //       openFetch.value = true
  //     } else if (val === 'payment') {
  //       openPayment.value = true
  //     } else if (val === 'gift') {
  //       isGift.value = true
  //     } else if (val === 'specs') {
  //       selectSpecs.value = true
  //     } else if (val === 'discount') {
  //       openDiscount.value = true
  //     } else if (val === 'discountDetail') {
  //       openDetail.value = true
  //     }
  //   }
  //   // 获取订单部分支付列表(组合支付)
  //   let getPaymentList = () => {
  //     // this.$http.get(this.$api.getPartPaymentList)
  //     //   .then((res) => {
  //     //     const cartData = res.data && res.data[0] || {}
  //     //     const payments = cartData.payments || []
  //     //     if (payments.length) {
  //     //       this.$store.commit('cart/SET_CART_DATA', cartData)
  //     //       this.$store.commit('cart/SET_SETTLE_DATA', cartData)
  //     //       this.openPayment = true
  //     //     }
  //     //     if (this.settle && this.settle.id) {
  //     //       // 支付成功，清除结算数据，结算未支付，重新打开支付页面
  //     //       if (this.settle.status == 4) {
  //     //         this.$store.commit('cart/SET_SETTLE_DATA', {})
  //     //       } else {
  //     //         this.openPayment = true
  //     //       }
  //     //     }
  //     //   })
  //   }
  //   return {
  //     openCustom,
  //     openFetch,
  //     openPayment,
  //     isGift,
  //     selectSpecs,
  //     openDiscount,
  //     openDetail,
  //     handleOpenPage,
  //     getPaymentList
  //   }
  // }
  data() {
    return {
      openCustom: false, // 打开客户列表
      openFetch: false, // 打开取单列表
      openPayment: false, // 打开支付页面
      isGift: false,
      selectSpecs: false, //打开规格选择
      openDiscount: false, //打开整单优惠
      openDetail: false //打开优惠明细
    }
  },
  computed: {
    // ...mapGetters(['settle'])
  },
  created() {
    // this.getPaymentList()
  },
  methods: {
    // customer客户列表 fetchOrder挂单取单列表 payment支付列表 gift赠品列表
    handleOpenPage(val) {
      console.log(val)
      if (val === 'customer') {
        this.openCustom = true
      } else if (val === 'fetchOrder') {
        this.openFetch = true
      } else if (val === 'payment') {
        this.openPayment = true
      } else if (val === 'gift') {
        this.isGift = true
      } else if (val === 'specs') {
        this.selectSpecs = true
      } else if (val === 'discount') {
        this.openDiscount = true
      } else if (val === 'discountDetail') {
        this.openDetail = true
      }
    },
    // 获取订单部分支付列表(组合支付)
    getPaymentList() {
      this.$http.get(this.$api.getPartPaymentList)
        .then((res) => {
          const cartData = res.data && res.data[0] || {}
          const payments = cartData.payments || []
          if (payments.length) {
            this.$store.commit('cart/SET_CART_DATA', cartData)
            this.$store.commit('cart/SET_SETTLE_DATA', cartData)
            this.openPayment = true
          }
          if (this.settle && this.settle.id) {
            // 支付成功，清除结算数据，结算未支付，重新打开支付页面
            if (this.settle.status == 4) {
              this.$store.commit('cart/SET_SETTLE_DATA', {})
            } else {
              this.openPayment = true
            }
          }
        })
    }
  }
}
</script>

<style lang="less" scoped>
.cashier-desk {
  width: 100%;
  background: #f0f2f5;
  min-height: calc(100vh - 88px);
}
</style>
