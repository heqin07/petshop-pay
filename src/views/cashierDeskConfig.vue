<template>
  <div>
    <p class="title">收银台设置</p>
    <p class="little">优惠折扣设置</p>
    <div class="content">
      <span>整单折扣</span>
      <el-switch
        v-model="discount.isDiscount"
        class="ml-2"
        active-color="#13ce66"
      /><br>
      <el-tag
        v-for="(tag, index) in arr1"
        :key="tag"
        class="mx-1"
        closable
        @close="removeTag(arr1, index)"
      >
        {{ tag }}折
      </el-tag>
      <div
        class="detail"
        v-if="discount.isDiscount === true"
      >
        <el-input
          type="number"
          step="0.1"
          :min="0.1"
          :max="9.9"
          v-model="discount.discountValue"
          placeholder="0.1-9.9"
        />
        <el-button
          type="primary"
          @click="getDiscountList(1)"
        >确定</el-button>
      </div>
    </div>
    <div class="content">
      <span>整单立减</span>
      <el-switch
        v-model="discount.isReduce"
        class="ml-2"
        active-color="#13ce66"
      /><br>
      <el-tag
        v-for="(tag, index) in arr2"
        :key="tag"
        class="mx-1"
        closable
        @close="removeTag(arr2, index)"
      >
        减{{ tag }}元
      </el-tag>
      <div
        class="detail"
        v-if="discount.isReduce === true"
      >
        <el-input
          type="number"
          step="0.01"
          :min="0"
          :max="50000"
          v-model="discount.reduceValue"
          placeholder="0-50000"
        />
        <el-button
          type="primary"
          @click="getDiscountList(2)"
        >确定</el-button>
      </div>
    </div>
    <p class="little">收赠品设置</p>
    <div
      class="content"
      style="margin-left: 20px"
    >
      <el-switch
        v-model="discount.isFreeGift"
        class="ml-2"
        active-color="#13ce66"
      />
      <span>新赠品允许前台赠送</span>
    </div>
    <p class="little">抹零设置</p>
    <div
      class="content"
      style="margin-left: 20px"
    >
      <el-switch
        v-model="discount.isSmallChange"
        class="ml-2"
        active-color="#13ce66"
      />
      <span>开启后，门店可自行设置抹零</span>
    </div>
    <div
      v-if="discount.isSmallChange === true"
      style="margin-left: 20px"
      class="info-radio"
    >
      <div style="color: #666">抹零方式</div>
      <el-radio-group v-model="discount.smallChangeType">
        <el-radio
          label="CENT"
          size="large"
        >抹分</el-radio><br />
        <div class="text">向下抹分，如9.99元，则实收9.9元</div>
        <br />
        <el-radio
          label="JIAO"
          size="large"
        >抹角</el-radio><br />
        <div class="text">向下抹角，如9.9元，则实收9元</div>
        <br />
      </el-radio-group>
      <div class="content">
        <span>自动抹零开关</span>
        <el-switch
          v-model="discount.isAutoSmallChange"
          class="ml-2"
          active-color="#13ce66"
        />
        <span>开启后，使用开单时自动抹零</span>
      </div>
    </div>
    <p class="little">商品改价功能</p>
    <div style="margin-left: 20px">
      <div class="content">
        <el-switch
          v-model="discount.isChangePrice"
          class="ml-2"
          active-color="#13ce66"
        />
        <span>开启后，门店可自行商品改价</span>
      </div>
      <div
        v-if="discount.isChangePrice === true"
        style="color: #666"
      >
        <div>
          <span style="color: #666">商品改价范围：</span>
          <el-radio-group
            v-model="discount.changePriceType"
            @change="changeType"
          >
            <el-radio label="MONEY">按金额</el-radio>
            <el-radio label="SCALE">按比例</el-radio>
          </el-radio-group>
        </div>
        <div v-if="discount.changePriceType === 'MONEY'">
          <div>
            <div style="margin-bottom: 10px">
              <span>最多可加：</span>
              <el-input
                v-model="discount.changePriceMax"
                type="number"
                step="0.01"
                :min="0.01"
                :max="10000000"
                class="mount"
              >
                <template #append>元</template>
              </el-input>
              <span>有效范围：0.01元-10000000元</span>
            </div>
            <div>
              <span>最多可减：</span>
              <el-input
                v-model="discount.changePriceMin"
                type="number"
                step="0.01"
                :min="0.01"
                :max="10000000"
                class="mount"
              >
                <template #append>元</template>
              </el-input>
              <span>有效范围：0.01元-10000000元</span>
            </div>
          </div>
        </div>
        <div v-if="discount.changePriceType === 'SCALE'">
          <div>
            <div style="margin-bottom: 10px">
              <span>最多可加当前商品金额的：</span>
              <el-input
                v-model="discount.changePriceMax"
                type="number"
                step="0.01"
                :min="10"
                :max="200"
                class="mount"
              >
                <template #append>%</template>
              </el-input>
              <span>有效范围：10%-200%</span>
            </div>
            <div>
              <span>最多可减当前商品金额的：</span>
              <el-input
                v-model="discount.changePriceMin"
                type="number"
                step="0.01"
                :min="10"
                :max="200"
                class="mount"
              >
                <template #append>%</template>
              </el-input>
              <span>有效范围：10%-200%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <el-button
        type="primary"
        @click="saveConfig"
        style="margin-left: 250px; margin-top: 20px"
      >保存</el-button>
    </div>
  </div>
</template>

<script>
import { api } from "./config";

export default {
  data() {
    return {
      discount: {
        isDiscount: true,
        discountValue: "",
        isReduce: false,
        reduceValue: "",
        isFreeGift: false,
        isSmallChange: true,
        smallChangeType: "CENT",
        isAutoSmallChange: true,
        isChangePrice: true,
        changePriceType: "MONEY",
        changePriceMax: 0,
        changePriceMin: 0,
      },
      arr1: [],
      arr2: [],
    };
  },
  mounted() {
    console.log("Component is mounted!");
    this.loadConfig();
  },
  methods: {
    getDiscountList(val) {
      console.log(this.discount.discountValue);
      if (val === 1) {
        if (
          Number(this.discount.discountValue) >= 0.1 &&
          Number(this.discount.discountValue) <= 9.9
        ) {
          this.arr1.push(this.discount.discountValue);
          this.discount.discountValue = "";
        } else {
          ElMessage({
            message: "整单折扣超出0.1-9.9范围",
            type: "warning",
          });
        }
      } else if (val === 2) {
        if (
          Number(this.discount.reduceValue) >= 0 &&
          Number(this.discount.reduceValue) <= 50000
        ) {
          this.arr2.push(this.discount.reduceValue);
          this.discount.reduceValue = "";
        } else {
          ElMessage({
            message: "整单立减超出0-50000范围",
            type: "warning",
          });
        }
      }
    },
    removeTag(arr, index) {
      arr.splice(index, 1)
    },
    saveConfig() {
      let params = this.discount;
      params.discountValue = this.arr1.join(",");
      params.reduceValue = this.arr2.join(",");
      this.$http.post(api.cashierConfig, params).then((res) => {
        console.log(res);
      });
    },
    changeType(value) {
      this.discount.changePriceMin = 0;
      this.discount.changePriceMax = 0;
    },
    loadConfig() {
      this.$http.get(api.cashierConfigEffecting).then((res) => {
      });
    },
  },
};
</script>

<style lang="less" scoped>
.title {
  font-size: 18px;
  color: #333;
}
.little {
  font-size: 16px;
  color: #666;
}
.content {
  margin-bottom: 12px;
  color: #666;
  > span {
    font-size: 14px;
    margin: 0 20px;
  }
  .mx-1 {
    margin-bottom: 10px;
  }
  .detail {
    margin-left: 20px;
    .el-input {
      width: 140px;
      margin-right: 20px;
    }
  }
}
.text {
  font-size: 14px;
  margin-left: 20px;
  color: #666;
}
.mount {
  width: 160px;
  margin: 0 10px;
  ::v-deep(.el-input-group__append) {
    // background-color: #fff;
    // padding-left: 0;
    padding: 0 11px;
  }
  // ::v-deep(.el-input__inner) {
  // border-right: none;
  // }
}
.info-radio {
  .el-radio-group {
    display: block;
  }
}
</style>
