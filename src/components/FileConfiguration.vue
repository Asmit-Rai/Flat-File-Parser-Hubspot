<template>
  <div class="layout-container">
    <div class="main-content">
      <div class="config-card">
        <h2 class="card-title">File Configuration</h2>
        <div class="config-section">
          <ToggleSwitch label="Has Headers?" v-model="config.hasHeaders" />
          <ToggleSwitch
            label="Fields enclosed in double quotes?"
            v-model="config.hasQuotes"
          />
          <div class="dropdown-row">
            <label class="dropdown-label">Delimiter Type</label>
            <select v-model="config.delimiterType" class="dropdown-select">
              <option value="comma">Comma (,)</option>
              <option value="pipe">Pipe (|)</option>
              <option value="fixed">Fixed Width</option>
            </select>
          </div>
        </div>
      </div>

      <div class="upload-card">
        <h2 class="card-title">File Upload</h2>
        <p class="upload-note">
          Select a CSV according to the above configuration.
        </p>
        <input
          type="file"
          name="file"
          @change="handleFileChange"
          ref="csvFileInput"
          accept=".csv"
        />
        <p class="upload-note" v-if="uploadState.message">
          {{ uploadState.message }}
        </p>

        <div
          class="status-section"
          v-if="
            uploadState.isUploading ||
            uploadState.isProcessing ||
            uploadState.error
          "
        >
          <div v-if="uploadState.isUploading" class="status-box uploading">
            <p>Uploading file...</p>
          </div>
          <div v-if="uploadState.isProcessing" class="status-box processing">
            <p>Please wait...</p>
          </div>
          <div v-if="uploadState.error" class="status-box error">
            <p>Error: {{ uploadState.error }}</p>
          </div>
        </div>
      </div>

      <button
        class="submit-button"
        type="button"
        @click="submitFile"
        :disabled="uploadState.isUploading || uploadState.isProcessing"
      >
        {{
          uploadState.isUploading || uploadState.isProcessing
            ? "Processing..."
            : "Submit & Edit CSV"
        }}
      </button>
    </div>

    <EditCsvModal
      :show="modalData.show"
      :headers="modalData.headers"
      :data="modalData.data"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import ToggleSwitch from "../components/ToggleSwitch.vue";
import EditCsvModal from "../components/EditCsvModal.vue";
import "../assets/css/FileConfig.css";

const csvFileInput = ref(null);

const config = reactive({
  hasHeaders: true,
  hasQuotes: false,
  delimiterType: "comma",
});

const uploadState = reactive({
  file: null,
  message: "",
  isUploading: false,
  isProcessing: false,
  error: "",
});

const modalData = reactive({
  show: false,
  headers: [],
  data: [],
});

const handleFileChange = (event) => {
  uploadState.error = "";
  const file = event.target.files[0];
  if (!file) {
    uploadState.message = "Please upload a CSV";
    uploadState.file = null;
    return;
  }
  if (file.name.toLowerCase().endsWith(".csv")) {
    uploadState.message = `Selected file: ${file.name}`;
    uploadState.file = file;
  } else {
    uploadState.message = "Please upload a valid .csv file";
    uploadState.file = null;
    csvFileInput.value.value = ""; 
  }
};

const submitFile = async () => {
  if (!uploadState.file) {
    uploadState.error = "Please select a file before submitting";
    return;
  }

  uploadState.error = "";
  uploadState.isUploading = true;
  uploadState.isProcessing = false;

  const formData = new FormData();
  formData.append("file", uploadState.file);
  formData.append("hasHeaders", config.hasHeaders);
  formData.append("hasQuotes", config.hasQuotes);
  const delimiterMap = { comma: ",", pipe: "|", fixed: "fixed" };
  formData.append("delimiter", delimiterMap[config.delimiterType]);

  try {
    const response = await fetch("http://localhost:3000/api/uploads", {
      method: "POST",
      body: formData,
    });

    uploadState.isUploading = false;
    uploadState.isProcessing = true;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        JSON.parse(errorText)?.message ||
          errorText ||
          `Server Error: ${response.statusText}`
      );
    }

    const result = await response.json();
    uploadState.message = "File processed! Data is ready for editing.";

    if (result.preview) {
      modalData.headers = result.preview.headers;
      modalData.data = result.preview.rows;
      modalData.show = true;
    }
  } catch (error) {
    console.error("Upload failed:", error);
    uploadState.error = error.message;
  } finally {
    uploadState.isUploading = false;
    uploadState.isProcessing = false;
  }
};

const closeModal = () => {
  modalData.show = false;
};
</script>
