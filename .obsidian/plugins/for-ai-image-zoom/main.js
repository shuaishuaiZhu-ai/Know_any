const { Plugin } = require("obsidian");

module.exports = class ForAiImageZoomPlugin extends Plugin {
  onload() {
    this.overlay = null;
    this.registerDomEvent(document, "click", (event) => this.handleImageClick(event), true);
  }

  onunload() {
    this.closeOverlay();
  }

  handleImageClick(event) {
    if (this.overlay) {
      return;
    }

    const target = event.target;
    if (!target || typeof target.closest !== "function") {
      return;
    }

    if (target.closest(".for-ai-image-zoom-overlay")) {
      return;
    }

    const selector = [
      ".markdown-preview-view img:not(.emoji)",
      ".markdown-source-view.mod-cm6 img:not(.emoji)",
      ".workspace-leaf-content[data-type=\"image\"] img:not(.emoji)",
      ".image-container img:not(.emoji)"
    ].join(", ");

    const image = target.closest(selector);
    if (!image || !this.app.workspace.containerEl.contains(image)) {
      return;
    }

    const src = image.currentSrc || image.src || image.getAttribute("src");
    if (!src) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openOverlay(src, image.getAttribute("alt") || "");
  }

  openOverlay(src, alt) {
    const overlay = document.createElement("div");
    overlay.className = "for-ai-image-zoom-overlay";

    const stage = document.createElement("div");
    stage.className = "for-ai-image-zoom-stage";

    const image = document.createElement("img");
    image.className = "for-ai-image-zoom-image";
    image.draggable = false;
    image.src = src;
    image.alt = alt;

    const closeButton = document.createElement("button");
    closeButton.className = "for-ai-image-zoom-close";
    closeButton.type = "button";
    closeButton.textContent = "Close";

    const resetButton = document.createElement("button");
    resetButton.className = "for-ai-image-zoom-reset";
    resetButton.type = "button";
    resetButton.textContent = "Reset";

    const badge = document.createElement("div");
    badge.className = "for-ai-image-zoom-badge";

    stage.appendChild(image);
    overlay.appendChild(stage);
    overlay.appendChild(closeButton);
    overlay.appendChild(resetButton);
    overlay.appendChild(badge);
    document.body.appendChild(overlay);

    const state = {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      dragStartX: 0,
      dragStartY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      dragging: false
    };

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const update = () => {
      image.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
      badge.textContent = `${Math.round(state.scale * 100)}%`;
    };

    const setScale = (nextScale, clientX, clientY) => {
      const oldScale = state.scale;
      const newScale = clamp(nextScale, 0.2, 8);
      if (newScale === oldScale) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const relX = clientX - centerX - state.offsetX;
      const relY = clientY - centerY - state.offsetY;
      const ratio = newScale / oldScale;

      state.offsetX += relX * (1 - ratio);
      state.offsetY += relY * (1 - ratio);
      state.scale = newScale;
      update();
    };

    const reset = () => {
      state.scale = 1;
      state.offsetX = 0;
      state.offsetY = 0;
      update();
    };

    const onWheel = (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 0.88;
      setScale(state.scale * factor, event.clientX, event.clientY);
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      stage.classList.add("is-dragging");
      state.dragging = true;
      state.dragStartX = event.clientX;
      state.dragStartY = event.clientY;
      state.startOffsetX = state.offsetX;
      state.startOffsetY = state.offsetY;
      stage.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!state.dragging) {
        return;
      }

      state.offsetX = state.startOffsetX + event.clientX - state.dragStartX;
      state.offsetY = state.startOffsetY + event.clientY - state.dragStartY;
      update();
    };

    const onPointerUp = (event) => {
      if (!state.dragging) {
        return;
      }

      state.dragging = false;
      stage.classList.remove("is-dragging");
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    };

    const onOverlayClick = (event) => {
      if (event.target === overlay || event.target === stage) {
        this.closeOverlay();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        this.closeOverlay();
      }
    };

    const cleanup = [
      ["wheel", stage, onWheel, { passive: false }],
      ["pointerdown", image, onPointerDown],
      ["pointermove", stage, onPointerMove],
      ["pointerup", stage, onPointerUp],
      ["pointercancel", stage, onPointerUp],
      ["click", overlay, onOverlayClick],
      ["click", closeButton, () => this.closeOverlay()],
      ["click", resetButton, reset],
      ["dblclick", image, reset],
      ["keydown", document, onKeyDown]
    ];

    for (const [type, element, handler, options] of cleanup) {
      element.addEventListener(type, handler, options);
    }

    this.overlay = {
      element: overlay,
      cleanup: () => {
        for (const [type, element, handler, options] of cleanup) {
          element.removeEventListener(type, handler, options);
        }
      }
    };

    update();
  }

  closeOverlay() {
    if (!this.overlay) {
      return;
    }

    this.overlay.cleanup();
    this.overlay.element.remove();
    this.overlay = null;
  }
};
