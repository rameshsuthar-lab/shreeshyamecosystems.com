// Media Upload Functionality
// Client-side file handling with localStorage persistence

class MediaManager {
  constructor() {
    this.storageKey = 'powerPlantMedia';
    this.mediaList = this.loadMedia();
    this.selectedFiles = [];
    this.objectUrls = [];
    
    // Create modal if not exists
    this.createModal();
    
    // Get elements after creation
    this.modal = document.getElementById('mediaModal');
    this.fileInput = document.getElementById('mediaFileInput');
    this.previewContainer = document.getElementById('mediaPreviewContainer');
    this.saveBtn = document.getElementById('mediaSaveBtn');
    this.cancelBtn = document.getElementById('mediaCancelBtn');
    this.closeBtn = document.getElementById('mediaModalClose');
    
    this.init();
  }

  createModal() {
    // Remove existing modal if any
    const existing = document.getElementById('mediaModal');
    if (existing) existing.remove();
    
    const modalHTML = `
      <div id="mediaModal" class="media-modal">
        <div class="media-modal-overlay"></div>
        <div class="media-modal-content">
          <div class="media-modal-header">
            <h3><i class="fas fa-images"></i> Add Project Media</h3>
            <button class="media-modal-close" id="mediaModalClose" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="media-modal-body">
            <div class="media-upload-area">
              <label for="mediaFileInput" class="media-upload-btn">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Choose Images/Videos</span>
                <input type="file" id="mediaFileInput" accept="image/*,video/*" multiple>
              </label>
              <p class="media-upload-hint">PNG, JPG, MP4 (Max 3MB after resize)</p>
            </div>
            <div class="media-preview-container" id="mediaPreviewContainer"></div>
          </div>
          <div class="media-modal-footer">
            <button class="btn btn-secondary" id="mediaCancelBtn">Cancel</button>
            <button class="btn btn-primary" id="mediaSaveBtn" disabled>
              <i class="fas fa-save"></i> Save Media (<span id="saveCount">0</span>)
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  init() {
    // Open modal trigger (will be called from main script)
    window.openMediaModal = () => this.openModal();

    document.querySelectorAll('.add-media-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.openModal());
    });

    // File input change handler
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e));

    // Save button
    this.saveBtn.addEventListener('click', () => this.saveMedia());

    // Cancel/Close handlers
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());

    // Close on overlay click
    this.modal.querySelector('.media-modal-overlay').addEventListener('click', () => this.closeModal());

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Render existing media
    this.renderGallery();
  }

  openModal() {
    this.previewContainer.innerHTML = '';
    this.fileInput.value = '';
    this.selectedFiles = [];
    this.clearObjectUrls();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.previewContainer.innerHTML = '';
    this.fileInput.value = '';
    this.selectedFiles = [];
    this.clearObjectUrls();
  }

  async handleFiles(e) {
    const files = Array.from(e.target.files || []);
    this.previewContainer.innerHTML = '';
    this.selectedFiles = [];
    this.clearObjectUrls();
    
    this.saveBtn.disabled = true;
    document.getElementById('saveCount').textContent = '0';

    for (let file of files) {
      // Size check before processing
      if (file.size > 50 * 1024 * 1024) {
        this.showError(file.name + ' exceeds 50MB');
        continue;
      }

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.showError(file.name + ' not supported');
        continue;
      }

      const id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      let previewUrl, processedFile;
      
      if (file.type.startsWith('image/') && file.size > 3 * 1024 * 1024) {
        // Resize large images
        previewUrl = await this.resizeImage(file, 1024, 768);
        processedFile = await this.dataURLtoFile(previewUrl, file.name);
      } else {
        previewUrl = URL.createObjectURL(file);
        processedFile = file;
      }
      
      this.objectUrls.push(previewUrl);
      this.selectedFiles.push({
        id,
        file: processedFile,
        previewUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        originalSize: file.size,
        processedSize: processedFile.size,
        deleteAfter: false
      });


      const preview = this.createPreview(processedFile, previewUrl, id);
      this.previewContainer.appendChild(preview);
      
      // Delete after upload checkbox handler
      const checkbox = preview.querySelector('.delete-after-checkbox');
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          const itemIndex = this.selectedFiles.findIndex(item => item.id === id);
          if (itemIndex !== -1) {
            this.selectedFiles[itemIndex].deleteAfter = e.target.checked;
          }
        });
      }
    }

    
    // Update save button
    const count = this.selectedFiles.length;
    document.getElementById('saveCount').textContent = count;
    this.saveBtn.disabled = count === 0;
  }

  resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  dataURLtoFile(dataurl, filename) {
    return fetch(dataurl)
      .then(res => res.blob())
      .then(blob => new File([blob], filename, { type: 'image/jpeg' }));
  }

  createPreview(file, dataUrl, index) {
    const isVideo = file.type.startsWith('video/');
    const div = document.createElement('div');
    div.className = 'media-preview-item';
    div.dataset.index = index;

    const imgOrVideo = isVideo 
      ? `<video src="${dataUrl}" controls muted preload="metadata" class="media-preview-video"></video>`
      : `<img src="${dataUrl}" alt="${file.name}" class="media-preview-image">`;

    div.innerHTML = `
      ${imgOrVideo}
      <div class="media-preview-info">
        <span class="media-file-name">${file.name}</span>
        <span class="media-file-size">${(file.size / 1024 / 1024).toFixed(1)} MB</span>
      </div>
      <div class="media-delete-option">
        <label style="font-size: 13px; color: var(--gray); cursor: pointer;">
          <input type="checkbox" class="delete-after-checkbox" data-id="${index}"> 
          Delete after upload?
        </label>
      </div>
      <button class="media-preview-remove" data-index="${index}"><i class="fas fa-times"></i></button>

    `;

    // Remove preview
    div.querySelector('.media-preview-remove').addEventListener('click', () => {
      this.selectedFiles = this.selectedFiles.filter((item) => item.id !== index);
      div.remove();
    });

    return div;
  }

  saveMedia() {
    if (this.selectedFiles.length === 0) {
      this.showError('Please choose at least one image or video');
      return;
    }

    let addedCount = 0;
    let deletedCount = 0;
    const newMedia = [];
    for (const item of this.selectedFiles) {
      if (item.deleteAfter) {
        deletedCount++;
        URL.revokeObjectURL(item.previewUrl);
      } else {
        newMedia.push({
          name: item.file.name,
          size: `${(item.file.size / 1024 / 1024).toFixed(1)} MB`,
          url: item.previewUrl,
          type: item.type,
          id: item.id,
          persisted: false
        });
        addedCount++;
      }
    }

    this.mediaList.unshift(...newMedia);

    const saved = this.saveMediaList();

    this.closeModal();
    this.renderGallery();

    if (saved) {
      if (addedCount > 0) {
        this.showSuccess(`${addedCount} item(s) added, ${deletedCount} deleted as requested.`);
      } else {
        this.showSuccess(`No items added (all marked for delete). Gallery unchanged.`);
      }
    } else {
      this.showError('Some media added for session, but storage full - may not persist. Check gallery.');
    }
  }


  loadMedia() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }

  checkStorageQuota() {
    try {
      const quota = navigator.storage ? navigator.storage.estimate() : { usage: 0, quota: 5*1024*1024 };
      const used = quota.usage || 0;
      const percent = (used / quota.quota) * 100;
      
      if (percent > 80) {
        this.clearStorage();
        this.showError(`Storage full (${percent.toFixed(0)}%). Cleared old media to make space.`);
        return false;
      }
      return true;
    } catch {
      return true; // Fallback
    }
  }

  clearStorage() {
    localStorage.removeItem(this.storageKey);
    this.mediaList = [];
    this.renderGallery();
  }

  saveMediaList() {
    if (!this.checkStorageQuota()) return false;
    
    try {
      // Limit to last 20 items
      const limitedList = this.mediaList.slice(0, 20);
      const data = JSON.stringify(limitedList);
      
      if (data.length > 4 * 1024 * 1024) { // 4MB limit
        this.showError('Too much media stored. Keeping latest 10 items.');
        const shortList = limitedList.slice(0, 10);
        localStorage.setItem(this.storageKey, JSON.stringify(shortList));
        this.mediaList = shortList;
        return true;
      }
      
      localStorage.setItem(this.storageKey, data);
      return true;
    } catch (e) {
      console.error('Storage save failed:', e);
      this.clearStorage();
      return false;
    }
  }

  clearObjectUrls() {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls = [];
  }

  renderGallery() {
    const galleries = document.querySelectorAll('.media-gallery');
    galleries.forEach(gallery => {
      if (this.mediaList.length === 0) {
        gallery.innerHTML = '<p class="no-media">No media added yet. <button class="add-media-btn" onclick="openMediaModal()">Add first media</button></p>';
        return;
      }

      gallery.innerHTML = this.mediaList.map(media => `
        <div class="media-gallery-item">
          ${media.type === 'video' 
            ? `<video src="${media.url}" controls preload="metadata" class="media-gallery-video"></video>`
            : `<img src="${media.url}" alt="${media.name}" class="media-gallery-image">`
          }
          <div class="media-gallery-overlay">
            <button class="media-remove-btn" onclick="window.mediaManager.removeMedia('${media.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('');
    });
  }

  removeMedia(id) {
    this.mediaList = this.mediaList.filter(m => m.id !== id);
    this.saveMediaList();
    this.renderGallery();
    this.showSuccess('Media removed');
  }

  showError(message) {
    this.showNotification('error', message);
  }

  showSuccess(message) {
    this.showNotification('success', message);
  }

  showNotification(type, message) {
    // Reuse existing notification system or create simple one
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}

// Robust initialization with button state management
(() => {
  // Global ready flag
  window.mediaReady = false;
  window.mediaManager = null;
  
  console.log('🎥 MediaManager: Bootstrap starting...');
  
  // BULLETPROOF INIT - DOMContentLoaded guarantee
  function initMediaManager() {
    if (window.mediaReady) {
      console.log('🎥 MediaManager: Already initialized');
      return true;
    }
    
    console.log('🎥 MediaManager: DOM check - modal exists:', !!document.getElementById('mediaModal'));
    
    try {
      // Create immediately - no waiting
      window.mediaManager = new MediaManager();
      window.mediaReady = true;
      
      console.log('✅ MediaManager: SUCCESSFULLY initialized');
      
      // Update ALL buttons immediately
      document.querySelectorAll('.add-media-btn, [onclick*="openMediaModal"], button[data-media]').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('loading');
        if (btn.classList.contains('loading')) {
          btn.innerHTML = btn.innerHTML.replace(/Loading\\.{3}/i, '<i class="fas fa-plus"></i> Add Media');
        }
        console.log('🎥 Button enabled:', btn);
      });
      
      // Render galleries
      if (window.mediaManager.renderGallery) {
        window.mediaManager.renderGallery();
        console.log('🎥 Galleries rendered');
      }
      
      return true;
    } catch (error) {
      console.error('❌ MediaManager init FAILED:', error);
      return false;
    }
  }
  
  // IMMEDIATE FAILSAFE openMediaModal
  window.openMediaModal = () => {
    console.log('🎥 openMediaModal called - ready:', window.mediaReady, 'manager:', !!window.mediaManager);
    
    if (window.mediaReady && window.mediaManager?.openModal) {
      window.mediaManager.openModal();
      console.log('✅ Modal opened');
      return;
    }
    
    // Show loading on ALL buttons
    document.querySelectorAll('.add-media-btn, [onclick*="openMediaModal"]').forEach(btn => {
      btn.classList.add('loading');
      btn.disabled = true;
      console.log('🔄 Button loading state:', btn);
    });
    
    // FORCE init and retry
    const maxRetries = 20;
    let retries = 0;
    
    const forceInit = () => {
      retries++;
      console.log(`🔄 MediaManager force init attempt ${retries}/${maxRetries}`);
      
      if (initMediaManager() || retries >= maxRetries) {
        if (window.mediaReady) {
          window.mediaManager.openModal();
        } else {
          console.error('❌ MediaManager FAILED after retries');
          alert('Media uploader temporarily unavailable. Please refresh page.');
          // Reset buttons
          document.querySelectorAll('.add-media-btn').forEach(btn => {
            btn.classList.remove('loading');
            btn.disabled = false;
          });
        }
        return;
      }
      
      setTimeout(forceInit, 150);
    };
    
    forceInit();
  };
  
  // Safe render
  window.renderMediaGallery = () => {
    console.log('📸 renderMediaGallery called');
    window.mediaManager?.renderGallery();
  };
  
  // MULTIPLE INIT TRIGGERS
  const triggers = ['DOMContentLoaded', 'load'];
  triggers.forEach(event => {
    if (document.readyState === 'loading') {
      document.addEventListener(event, initMediaManager, { once: true });
    } else {
      initMediaManager();
    }
  });
  
  // MutationObserver for dynamic content
  const observer = new MutationObserver(() => {
    if (!window.mediaReady) {
      console.log('🔍 DOM mutation - retrying init');
      initMediaManager();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Connect existing onclick handlers immediately
  document.querySelectorAll('[onclick*="openMediaModal"]').forEach(btn => {
    const original = btn.onclick;
    btn.onclick = () => {
      console.log('🖱️ onclick handler fired');
      window.openMediaModal();
    };
  });
  
  console.log('🎥 MediaManager: Bootstrap COMPLETE - openMediaModal ready');
  
  window.MediaManager = MediaManager;
})();
