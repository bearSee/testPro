<template>
  <transition
    name="main-classes-transition"
    enter-active-class="animated fadeIn"
    leave-active-class="animated zoomOutDown"
  >
    <router-view></router-view>
  </transition>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style type="text/css">
html{
  overflow: hidden;
}
html,body{
  height: 100%;
  background-color: #f9f9f9;
  padding: 0 !important;
}
textarea {
  font-family: inherit;
}
section, header, aside, main {
  height: 100%;
}
</style>
