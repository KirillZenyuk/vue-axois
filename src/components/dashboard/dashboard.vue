<template>
    <div id="dashboard">
        <h1>That's the dashboard!</h1>
        <p>You should only get here if you're authenticated!</p>
        <p>Email: {{ user.email }}</p>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        computed: {
            user() {
                return this.$store.getters.user
            }
        },
    }
</script>

<style scoped>
    h1, p {
        text-align: center;
    }

    p {
        color: red;
    }
</style>
