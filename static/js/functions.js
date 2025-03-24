const dropZone = document.getElementById('drop-zone');
const dropText = document.getElementById('drop-text');
const fileInput = document.getElementById('file-upload');
const resultContainer = document.getElementById('result-container');
const loadingSpinner = document.getElementById('loading-spinner');
const resultImage = document.getElementById('result-image');
const detectionText = document.getElementById('detection-text');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('drag-over');
    dropText.textContent = 'Drop your image here';
}

function unhighlight(e) {
    dropZone.classList.remove('drag-over');
    dropText.textContent = 'Drag and drop your image here';
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

fileInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

function handleFiles(files) {
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    loadingSpinner.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    fetch('/object-detection/', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    })
    .then(data => {
        loadingSpinner.classList.add('hidden');
        
        resultContainer.classList.remove('hidden');
        resultImage.src = `data:image/png;base64,${data.result_img}`;
        
        detectionText.innerHTML = `<p class="text-lg font-semibold">${data.detected_text || 'No detection'}</p>`;

        resultContainer.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to process image');
        loadingSpinner.classList.add('hidden');
    });
}