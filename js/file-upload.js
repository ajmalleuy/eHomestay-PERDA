/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Payment Proof File Upload Script (file-upload.js)
 * Validates tourist payment proof uploads on Page 2 (Booking Form):
 * - Allowed formats: JPG, PNG, PDF only
 * - Maximum file size: 5 MB (5,242,880 bytes)
 * - Displays clear file-size and file-format validation errors
 * ============================================================================
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// Global state used by Booking Form submission in validation.js
window.validPaymentProofFile = null;

function initPaymentProofUpload() {
  const dropzone = document.getElementById('paymentUploadZone');
  const fileInput = document.getElementById('paymentProofInput');
  const errorBox = document.getElementById('paymentFileErrorBox');
  const errorText = document.getElementById('paymentFileErrorText');
  const previewCard = document.getElementById('paymentUploadPreviewCard');
  const previewName = document.getElementById('previewFileName');
  const previewSize = document.getElementById('previewFileSize');
  const removeBtn = document.getElementById('removeUploadedFileBtn');
  const simulateOversizeBtn = document.getElementById('simulateOversizeFileBtn');
  const loadSampleReceiptBtn = document.getElementById('loadSampleReceiptBtn');

  if (!dropzone || !fileInput) return;

  // Click on dropzone opens native file dialog
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    fileInput.click();
  });

  // Keyboard accessibility (Enter or Space opens file picker)
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Drag & Drop events
  ['dragenter', 'dragover'].forEach((evtName) => {
    dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evtName) => {
    dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      validateAndProcessPaymentFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      validateAndProcessPaymentFile(fileInput.files[0]);
    }
  });

  // Remove uploaded file button
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      fileInput.value = '';
      window.validPaymentProofFile = null;
      previewCard?.classList.remove('show');
      errorBox?.classList.remove('show');
      dropzone.classList.remove('upload-error');
    });
  }

  // Helper button to test >5MB File-Size Validation Error immediately
  if (simulateOversizeBtn) {
    simulateOversizeBtn.addEventListener('click', () => {
      const fakeOversizeFile = {
        name: 'high_res_bank_receipt_scan.png',
        size: 6.8 * 1024 * 1024, // 6.8 MB (> 5MB limit)
        type: 'image/png'
      };
      validateAndProcessPaymentFile(fakeOversizeFile);
    });
  }

  // Helper button to load a valid sample receipt for effortless testing
  if (loadSampleReceiptBtn) {
    loadSampleReceiptBtn.addEventListener('click', () => {
      const sampleValidFile = {
        name: 'duitnow_instant_transfer_receipt.png',
        size: 248 * 1024, // 248 KB
        type: 'image/png',
        isSample: true
      };
      validateAndProcessPaymentFile(sampleValidFile);
    });
  }

  function showFileError(message) {
    window.validPaymentProofFile = null;
    previewCard?.classList.remove('show');
    dropzone.classList.add('upload-error');
    if (errorText) errorText.textContent = message;
    errorBox?.classList.add('show');
    showPerdaToast('File Upload Error', message, 'fa-circle-exclamation');
  }

  function validateAndProcessPaymentFile(file) {
    const fileNameLower = (file.name || '').toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type) || hasValidExt;

    // 1. Validate File Format (JPG, PNG, PDF only)
    if (!hasValidMime || !hasValidExt) {
      showFileError(
        `Invalid file format ("${file.name}"). Only JPG, PNG, and PDF files are accepted.`
      );
      return;
    }

    // 2. Validate File Size (Maximum 5 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      showFileError(
        `File size (${sizeInMB} MB) exceeds the 5.00 MB maximum limit! Please compress your receipt or upload a file under 5 MB.`
      );
      return;
    }

    // Valid File!
    errorBox?.classList.remove('show');
    dropzone.classList.remove('upload-error');
    window.validPaymentProofFile = file;

    const formattedSize =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = `${formattedSize} • Verified Format (${fileNameLower.endsWith('.pdf') ? 'PDF Document' : 'Image Receipt'})`;
    previewCard?.classList.add('show');

    showPerdaToast(
      'Payment Proof Ready',
      `"${file.name}" (${formattedSize}) passed validation.`,
      'fa-file-circle-check'
    );
  }
}

document.addEventListener('DOMContentLoaded', initPaymentProofUpload);

