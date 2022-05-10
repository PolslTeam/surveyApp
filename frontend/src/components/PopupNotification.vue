<template>
  <div class="alerts-box">
    <v-alert
      v-for="alertInfo in alertsList"
      :key="alertInfo.timestamp"
      :color="alertInfo.status === 'error' ? 'red' : 'green'"
      elevation="6"
      :type="alertInfo.status === 'error' ? 'error' : 'success'"
      transition="slide-y-transition"
      >{{ alertInfo.message }}
    </v-alert>
  </div>
</template>

<script>
export default {
  name: "PopupNotification",
  computed: {
    alertsList() {
      return this.$store.state.alerts;
    }
  }
};
</script>

<style scoped>
.alerts-box {
  position: fixed;
  z-index: 1000;
  right: 50px;
  bottom: 50px;
}
</style>
