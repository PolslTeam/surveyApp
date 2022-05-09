<template>
  <v-app>
    <app-bar />
    <popup-notification />
    <router-view class="main-wrapper" />
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar";
import PopupNotification from "@/components/PopupNotification";
export default {
  name: "Home",
  components: { PopupNotification, AppBar }
};
</script>
<style>
.main-wrapper {
  height: calc(100vh - 50px);
}
</style>
