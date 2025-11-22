<script setup>
import { ref, onMounted, computed } from 'vue';
import '../assets/css/CsvView.css';

const data = ref('');

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/get-csv-data');
    const csvParseData = await response.json();
    
    if (csvParseData.csvData && typeof csvParseData.csvData === 'string') {
      data.value = csvParseData.csvData;
    } else {
      console.error('Invalid CSV data received');
    }
  } catch (error) {
    console.error('Error fetching CSV:', error);
  }
});

const lines = computed(() => 
  data.value && typeof data.value === 'string' 
    ? data.value.trim().split('\n').filter(Boolean) 
    : []
);

const headers = computed(() => 
  lines.value.length > 0 ? lines.value[0].split(',') : []
);

const rows = computed(() => 
  lines.value.length > 1 
    ? lines.value.slice(1).map(line => line.split(',')) 
    : []
);
</script>

<template>
  <div class="csv-container">
    <div class="csv-card">
      <table v-if="data" class="csv-table">
        <thead>
          <tr>
            <th v-for="(h, i) in headers" :key="i">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>Loading CSV...</p>
    </div>
  </div>
</template>