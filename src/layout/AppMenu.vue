<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Budgrt',
    items: [
      { label: 'Budget Planner', icon: 'pi pi-calendar', to: '/' },
      { label: 'Action Center', icon: 'pi pi-clipboard', to: '/action-center' },
      { label: 'Transactions', icon: 'pi pi-credit-card', to: '/transactions' },
      { label: 'Banking', icon: 'pi pi-wallet', to: '/banking' },
      { label: 'Investments', icon: 'pi pi-chart-line', to: '/investments' },
      { label: 'Zakat', icon: 'pi pi-moon', to: '/zakat' }
    ]
  }
])
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
