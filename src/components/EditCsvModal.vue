<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit CSV Data</h2>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-actions">
          <button @click="addRow" class="action-btn add-btn">Add Row</button>
          <button @click="addColumn" class="action-btn add-btn">
            Add Column
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th v-for="(header, index) in localHeaders" :key="index">
                  <input type="text" v-model="localHeaders[index]" />
                  <button @click="deleteColumn(index)" class="delete-btn">
                    &times;
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in localData" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                  <input type="text" v-model="localData[rowIndex][cellIndex]" />
                </td>
                <td>
                  <button @click="deleteRow(rowIndex)" class="delete-btn">
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="downloadCSV" class="action-btn download-btn">
          Download as CSV
        </button>
        <button @click="syncWithHubSpot" class="action-btn sync-btn">
          Sync with HubSpot
        </button>
        <button @click="$emit('close')" class="action-btn cancel-btn">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  headers: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["close"]);

const localHeaders = ref([]);
const localData = ref([]);
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      localHeaders.value = JSON.parse(JSON.stringify(props.headers));
      localData.value = JSON.parse(JSON.stringify(props.data));
    }
  }
);

const addRow = () => {
  const newRow = Array(localHeaders.value.length).fill("");
  localData.value.push(newRow);
};

const addColumn = () => {
  localHeaders.value.push("New Column");
  localData.value.forEach((row) => row.push(""));
};

const deleteRow = (rowIndex) => {
  localData.value.splice(rowIndex, 1);
};

const deleteColumn = (colIndex) => {
  localHeaders.value.splice(colIndex, 1);
  localData.value.forEach((row) => row.splice(colIndex, 1));
};

const downloadCSV = () => {
  const headers = localHeaders.value.join(",");
  const rows = localData.value.map((row) => row.join(","));
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "edited_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const syncWithHubSpot = async () => {
  try {
    const payload = {
      headers: localHeaders.value,
      rows: localData.value,
    };
    await fetch('http://localhost:3000/csv-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await fetch('http://localhost:3000/process-csv', { method: 'POST' });
    const result = await res.json();

    if (result.success) {
      alert('Synced successfully');
    } else {
      alert('Failed' + (result.error || 'Unknown error'));
    }
  } catch (err) {
    console.error(err);
    alert('Error syncing');
  }
};
</script>
