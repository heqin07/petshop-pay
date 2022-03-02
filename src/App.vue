<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue';
</script>

<template>
  <div>
    <div>
      <router-link to="/">Order Home</router-link>
      <router-link to="/app">Order App</router-link>
      <router-link to="/cashierDeskConfig">收银台配置</router-link>
      <router-link to="/cashierDesk">收银台</router-link>

    </div>
    <router-view />
    <hello-world />
  </div>
</template>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
