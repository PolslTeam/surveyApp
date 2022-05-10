<template>
  <v-card>
    <v-card-title>
      <h3 style="text-align: start">
        {{ user.email }}
      </h3>
    </v-card-title>
    <v-card-text>
      <v-btn
        :color="user.is_blocked ? 'green' : 'red'"
        @click="blockUnblock(user.user_id)"
        :disabled="user.userType === 1"
      >
        {{ user.is_blocked ? "Unblock" : "Block" }} user
      </v-btn>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "UserTile",
  props: {
    user: Object
  },
  methods: {
    async blockUnblock(user_id) {
      await this.$store.dispatch("BLOCK_UNBLOCK_USER", user_id);
    }
  }
};
</script>
