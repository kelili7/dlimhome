<script setup>
const columns = [['dining', 'platters', 'craft', 'bakeware'], ['ritual', 'serving-bowls', 'gathering', 'dinnerware']]
</script>
<template><div class="hero-marquees" aria-hidden="true"><div v-for="(column, columnIndex) in columns" :key="columnIndex" class="marquee-window"><div class="marquee-track" :class="{ reverse: columnIndex === 1 }"><div v-for="copy in 2" :key="copy" class="marquee-group"><img v-for="name in column" :key="name" :src="`/images/ceramics/${name}.jpg`" alt="" width="640" height="640" /></div></div></div></div></template>