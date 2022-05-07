<template>
  <v-app>
    <app-bar />
    <router-view class="main-wrapper" />
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar";
export default {
  name: "Home",
  components: { AppBar }
};
</script>
<style>
.main-wrapper {
  height: calc(100vh - 50px);
}
</style>
