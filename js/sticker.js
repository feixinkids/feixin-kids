const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const fonts = [
  ["貓啃珠圓體", "\"MaokenZhuyuan\", \"Noto Sans TC\", sans-serif", "MaokenZhuyuan"],
  ["悠哉字體", "\"Yozai\", \"Noto Sans TC\", sans-serif", "Yozai"],
  ["寒蟬童圓體", "\"Chill\", \"Noto Sans TC\", sans-serif", "Chill"],
  ["得意黑", "\"Smiley\", \"Noto Sans TC\", sans-serif", "Smiley"],
  ["Maple Mono Rounded", "\"Maple\", \"Noto Sans TC\", sans-serif", "Maple"],
  ["辰宇落雁體", "\"ChenYu\", \"Noto Sans TC\", sans-serif", "ChenYu"],
  ["思源黑體", "\"Noto Sans TC\", sans-serif", "Noto Sans TC"],
  ["jf open 粉圓", "\"Huninn\", \"Noto Sans TC\", sans-serif", "Huninn"]
];

const themes = [
  ["car", "小車車", "#dff3ff", "#ef746e", "🚗"],
  ["truck", "挖土機", "#fff0bd", "#e59a22", "🚧"],
  ["dino", "恐龍", "#dff4df", "#65ad6b", "🦕"],
  ["rocket", "火箭", "#e8e3ff", "#7b70d0", "🚀"],
  ["zoo", "動物樂園", "#dff7ee", "#df9853", "🐾"],
  ["castle", "夢幻城堡", "#ffe1ed", "#b27bd1", "🏰"],
  ["bear", "小熊娃娃", "#fff0db", "#b8845e", "🧸"],
  ["unicorn", "獨角獸", "#f4e3ff", "#e779af", "🦄"],
  ["flower", "小花朵", "#fff0f5", "#e9759a", "🌸"],
  ["strawberry", "草莓", "#ffe3e5", "#e45e69", "🍓"],
  ["rainbow", "彩虹", "#e8f6ff", "#ee82a2", "🌈"],
  ["star", "星星", "#fff7d5", "#ddb039", "⭐"],
  ["cloud", "雲朵", "#e7f4ff", "#78afd2", "☁️"],
  ["forest", "森林", "#e5f2de", "#62a369", "🌳"],
  ["panda", "熊貓", "#f1f1f1", "#555555", "🐼"],
  ["ocean", "海洋", "#ddf3f8", "#45a0ba", "🐳"],
  ["heart", "愛心", "#ffe6ee", "#e96f94", "♥"],
  ["balloon", "氣球", "#ebefff", "#7889df", "🎈"]
];

const S = {
  name: "林小可",
  font: 0,
  fontScale: 1,
  color: "#4b3b52",
  outline: true,
  theme: "car",
  paper: "a4",
  qty: 24,
  img: null,
  url: null,
  crop: {
    x: 0,
    y: 0,
    scale: 1
  }
};

const cropCanvas = $("#cropCanvas");
const cropContext = cropCanvas.getContext("2d");

const sheetCanvas = $("#sheetCanvas");
const sheetContext = sheetCanvas.getContext("2d");

function fontButton(font, index) {
  return `
    <button
      class="font-btn ${index === S.font ? "active" : ""}"
      data-i="${index}"
      type="button"
    >
      <span style="font-family:${font[1]}">
        ${font[0]}
      </span>
    </button>
  `;
}

async function ensureFontLoaded(index) {
  const fontFamily = fonts[index][2];

  try {
    await document.fonts.load(`800 48px "${fontFamily}"`, "林小可");
  } catch (error) {
    console.warn(`字體載入失敗：${fontFamily}`, error);
  }
}

function updateFontButtonStatus() {
  $$(".font-btn").forEach((button, index) => {
    const fontFamily = fonts[index][2];
    const loaded = document.fonts.check(`24px "${fontFamily}"`, "林小可");

    button.title = loaded
      ? "字體已載入"
      : "字體尚未載入，將使用替代字體";

    button.classList.toggle("font-missing", !loaded);
  });
}

function bindFontButtons(container) {
  container.querySelectorAll(".font-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.i);

      if (Number.isNaN(index)) {
        return;
      }

      S.font = index;

      renderFonts();

      await ensureFontLoaded(index);
      drawSheet();

      updateFontButtonStatus();
    });
  });
}

function renderFonts() {
  $("#fontCount").textContent = `${fonts.length} 款固定字體`;

  $("#fontGrid").innerHTML = fonts
    .map((font, index) => fontButton(font, index))
    .join("");

  bindFontButtons($("#fontGrid"));
}

function renderFilters() {
  $("#filters").innerHTML = `
    <button class="active" type="button" data-c="全部">
      全部
    </button>
  `;
}

function renderThemes() {
  $("#backgroundGrid").innerHTML = themes
    .map((theme) => {
      return `
        <button
          class="bg-btn ${theme[0] === S.theme ? "active" : ""}"
          data-t="${theme[0]}"
          type="button"
        >
          <span
            class="swatch"
            style="background:${theme[2]}"
          >
            ${theme[4]}
          </span>

          <span>${theme[1]}</span>
        </button>
      `;
    })
    .join("");

  $$(".bg-btn").forEach((button) => {
    button.addEventListener("click", () => {
      S.theme = button.dataset.t;

      renderThemes();
      drawSheet();
    });
  });
}

function stickerSizeLabel(paper, quantity) {
  const sizes = {
    a4: {
      24: "約 6.3 × 3.2 cm",
      30: "約 6.3 × 2.5 cm",
      48: "約 4.6 × 2.0 cm"
    },
    "4x6": {
      16: "約 4.5 × 1.7 cm",
      20: "約 4.5 × 1.3 cm",
      24: "約 2.9 × 1.7 cm"
    }
  };

  return sizes[paper]?.[quantity] || "";
}

function renderQty() {
  const quantities = S.paper === "a4"
    ? [24, 30, 48]
    : [16, 20, 24];

  if (!quantities.includes(S.qty)) {
    S.qty = quantities[0];
  }

  $("#quantities").innerHTML = quantities
    .map((quantity) => {
      return `
        <button
          class="${quantity === S.qty ? "active" : ""}"
          data-n="${quantity}"
          type="button"
        >
          ${quantity} 張
          <small>
            單張 ${stickerSizeLabel(S.paper, quantity)}
          </small>
        </button>
      `;
    })
    .join("");

  $$("#quantities button").forEach((button) => {
    button.addEventListener("click", () => {
      S.qty = Number(button.dataset.n);

      renderQty();
      drawSheet();
    });
  });

  $("#layoutHint").textContent = S.paper === "a4"
    ? "尺寸依目前版面留白、間距與頁尾估算。"
    : "16、20 張為左右版；24 張為較小型左右版。尺寸依 4×6 相片版面估算。";
}

function setPaper(paper) {
  S.paper = paper;

  $$("#paperTabs button").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.paper === paper
    );
  });

  renderQty();
  drawSheet();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

$("#photoInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (S.url) {
    URL.revokeObjectURL(S.url);
  }

  S.url = URL.createObjectURL(file);

  try {
    S.img = await loadImage(S.url);

    resetCrop();

    $("#photoTools").hidden = false;

    drawCrop();
    drawSheet();
  } catch (error) {
    console.error("照片載入失敗", error);
  }
});

function resetCrop() {
  if (!S.img) {
    return;
  }

  S.crop = {
    x: 0,
    y: 0,
    scale: Math.max(
      cropCanvas.width / S.img.width,
      cropCanvas.height / S.img.height
    )
  };

  $("#zoomRange").value = 1;
}

function cropTransform() {
  const width = S.img.width * S.crop.scale;
  const height = S.img.height * S.crop.scale;

  return {
    x: (cropCanvas.width - width) / 2 + S.crop.x,
    y: (cropCanvas.height - height) / 2 + S.crop.y,
    width,
    height
  };
}

function drawCrop() {
  cropContext.clearRect(
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  if (!S.img) {
    return;
  }

  const transform = cropTransform();

  cropContext.drawImage(
    S.img,
    transform.x,
    transform.y,
    transform.width,
    transform.height
  );
}

$("#centerBtn").addEventListener("click", () => {
  resetCrop();
  drawCrop();
  drawSheet();
});

$("#zoomRange").addEventListener("input", (event) => {
  if (!S.img) {
    return;
  }

  const baseScale = Math.max(
    cropCanvas.width / S.img.width,
    cropCanvas.height / S.img.height
  );

  S.crop.scale = baseScale * Number(event.target.value);

  drawCrop();
  drawSheet();
});

let dragging = false;
let lastPointer = null;

$(".crop-wrap").addEventListener("pointerdown", (event) => {
  if (!S.img) {
    return;
  }

  dragging = true;
  lastPointer = [event.clientX, event.clientY];

  event.currentTarget.setPointerCapture(event.pointerId);
});

$(".crop-wrap").addEventListener("pointermove", (event) => {
  if (!dragging || !lastPointer) {
    return;
  }

  const rect = cropCanvas.getBoundingClientRect();

  S.crop.x +=
    (event.clientX - lastPointer[0]) *
    cropCanvas.width /
    rect.width;

  S.crop.y +=
    (event.clientY - lastPointer[1]) *
    cropCanvas.height /
    rect.height;

  lastPointer = [event.clientX, event.clientY];

  drawCrop();
  drawSheet();
});

$(".crop-wrap").addEventListener("pointerup", () => {
  dragging = false;
  lastPointer = null;
});

$(".crop-wrap").addEventListener("pointercancel", () => {
  dragging = false;
  lastPointer = null;
});

$(".crop-wrap").addEventListener(
  "wheel",
  (event) => {
    if (!S.img) {
      return;
    }

    event.preventDefault();

    const baseScale = Math.max(
      cropCanvas.width / S.img.width,
      cropCanvas.height / S.img.height
    );

    const currentZoom = S.crop.scale / baseScale;

    const nextZoom = Math.max(
      0.5,
      Math.min(
        4,
        currentZoom * (event.deltaY > 0 ? 0.94 : 1.06)
      )
    );

    S.crop.scale = baseScale * nextZoom;
    $("#zoomRange").value = nextZoom;

    drawCrop();
    drawSheet();
  },
  { passive: false }
);
function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(
    radius,
    width / 2,
    height / 2
  );

  context.beginPath();
  context.moveTo(x + safeRadius, y);

  context.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    safeRadius
  );

  context.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    safeRadius
  );

  context.arcTo(
    x,
    y + height,
    x,
    y,
    safeRadius
  );

  context.arcTo(
    x,
    y,
    x + width,
    y,
    safeRadius
  );

  context.closePath();
}

function createCroppedImage(size = 600) {
  const outputCanvas = document.createElement("canvas");

  outputCanvas.width = size;
  outputCanvas.height = size;

  const outputContext = outputCanvas.getContext("2d");

  if (!S.img) {
    return outputCanvas;
  }

  const cropCircleSize = 205;
  const transform = cropTransform();

  const cropStartX =
    (cropCanvas.width - cropCircleSize) / 2;

  const cropStartY =
    (cropCanvas.height - cropCircleSize) / 2;

  const scale = size / cropCircleSize;

  outputContext.drawImage(
    S.img,
    (transform.x - cropStartX) * scale,
    (transform.y - cropStartY) * scale,
    transform.width * scale,
    transform.height * scale
  );

  return outputCanvas;
}

function drawStickerText(
  context,
  textValue,
  centerX,
  centerY,
  maximumWidth,
  baseSize
) {
  const fontFamily = fonts[S.font][1];

  let fontSize = baseSize * S.fontScale;

  context.font = `800 ${fontSize}px ${fontFamily}`;

  while (
    fontSize > 8 &&
    context.measureText(textValue).width > maximumWidth
  ) {
    fontSize -= 1;
    context.font = `800 ${fontSize}px ${fontFamily}`;
  }

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";

  if (S.outline) {
    context.strokeStyle = "#ffffff";
    context.lineWidth = Math.max(
      3,
      fontSize * 0.14
    );

    context.strokeText(
      textValue,
      centerX,
      centerY
    );
  }

  context.fillStyle = S.color;

  context.fillText(
    textValue,
    centerX,
    centerY
  );
}

function drawExcavator(
  context,
  x,
  y,
  size,
  color
) {
  context.save();
  context.translate(x, y);

  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = Math.max(
    2,
    size * 0.05
  );

  context.fillRect(
    -size * 0.34,
    -size * 0.03,
    size * 0.5,
    size * 0.22
  );

  context.fillRect(
    -size * 0.18,
    -size * 0.28,
    size * 0.25,
    size * 0.26
  );

  context.beginPath();
  context.moveTo(
    size * 0.03,
    -size * 0.24
  );

  context.lineTo(
    size * 0.38,
    -size * 0.48
  );

  context.lineTo(
    size * 0.48,
    -size * 0.39
  );

  context.lineTo(
    size * 0.17,
    -size * 0.12
  );

  context.stroke();

  context.beginPath();
  context.moveTo(
    size * 0.48,
    -size * 0.39
  );

  context.lineTo(
    size * 0.56,
    -size * 0.12
  );

  context.lineTo(
    size * 0.38,
    -size * 0.09
  );

  context.closePath();
  context.fill();

  context.fillStyle = "#5b5360";

  context.beginPath();

  context.ellipse(
    -size * 0.12,
    size * 0.24,
    size * 0.28,
    size * 0.11,
    0,
    0,
    Math.PI * 2
  );

  context.fill();
  context.restore();
}

function drawDecoration(
  context,
  theme,
  x,
  y,
  width,
  height
) {
  context.fillStyle = theme[2];
  context.fillRect(x, y, width, height);

  const decorationSize =
    Math.min(width, height) * 0.6;

  context.save();

  context.globalAlpha = 0.4;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (theme[0] === "truck") {
    drawExcavator(
      context,
      x + width * 0.15,
      y + height * 0.24,
      decorationSize,
      theme[3]
    );

    drawExcavator(
      context,
      x + width * 0.86,
      y + height * 0.82,
      decorationSize,
      theme[3]
    );
  } else {
    context.font =
      `${decorationSize}px ` +
      `"Apple Color Emoji", ` +
      `"Segoe UI Emoji", sans-serif`;

    context.fillText(
      theme[4],
      x + width * 0.15,
      y + height * 0.24
    );

    context.fillText(
      theme[4],
      x + width * 0.86,
      y + height * 0.82
    );
  }

  context.restore();
}

function drawSticker(
  context,
  x,
  y,
  width,
  height,
  vertical
) {
  const theme = themes.find(
    (item) => item[0] === S.theme
  );

  if (!theme) {
    return;
  }

  context.save();

  roundedRect(
    context,
    x,
    y,
    width,
    height,
    Math.min(width, height) * 0.1
  );

  context.clip();

  drawDecoration(
    context,
    theme,
    x,
    y,
    width,
    height
  );

  const croppedImage = createCroppedImage();

  let imageSize;
  let imageX;
  let imageY;

  if (vertical) {
    imageSize = Math.min(
      width * 0.58,
      height * 0.54
    );

    imageX =
      x + (width - imageSize) / 2;

    imageY =
      y + height * 0.07;
  } else {
    imageSize = Math.min(
      height * 0.72,
      width * 0.34
    );

    imageX =
      x + width * 0.06;

    imageY =
      y + (height - imageSize) / 2;
  }

  context.save();

  context.beginPath();

  context.arc(
    imageX + imageSize / 2,
    imageY + imageSize / 2,
    imageSize / 2,
    0,
    Math.PI * 2
  );

  context.clip();

  if (S.img) {
    context.drawImage(
      croppedImage,
      imageX,
      imageY,
      imageSize,
      imageSize
    );
  } else {
    context.fillStyle = "#ffffffbb";

    context.fillRect(
      imageX,
      imageY,
      imageSize,
      imageSize
    );
  }

  context.restore();

  context.strokeStyle = "#ffffff";

  context.lineWidth = Math.max(
    3,
    imageSize * 0.04
  );

  context.beginPath();

  context.arc(
    imageX + imageSize / 2,
    imageY + imageSize / 2,
    imageSize / 2 -
      context.lineWidth / 2,
    0,
    Math.PI * 2
  );

  context.stroke();

  if (vertical) {
    drawStickerText(
      context,
      S.name,
      x + width / 2,
      y + height * 0.82,
      width * 0.82,
      height * 0.15
    );
  } else {
    const remainingWidth =
      width -
      (imageX - x) -
      imageSize;

    drawStickerText(
      context,
      S.name,
      imageX +
        imageSize +
        remainingWidth * 0.48,
      y + height / 2,
      remainingWidth - width * 0.08,
      height * 0.23
    );
  }

  context.restore();

  context.strokeStyle = "#6b53651d";

  roundedRect(
    context,
    x + 0.5,
    y + 0.5,
    width - 1,
    height - 1,
    Math.min(width, height) * 0.1
  );

  context.stroke();
}

function getLayout() {
  if (S.paper === "a4") {
    const layoutMap = {
      24: [3, 8],
      30: [3, 10],
      48: [4, 12]
    };

    const selectedLayout =
      layoutMap[S.qty];

    return [
      1240,
      1754,
      selectedLayout[0],
      selectedLayout[1],
      false,
      52,
      14
    ];
  }

  if (S.qty === 16) {
    return [
      1200,
      1800,
      2,
      8,
      false,
      54,
      16
    ];
  }

  if (S.qty === 20) {
    return [
      1200,
      1800,
      2,
      10,
      false,
      54,
      14
    ];
  }

  return [
    1200,
    1800,
    3,
    8,
    false,
    54,
    14
  ];
}

function drawSheet() {
  const [
    canvasWidth,
    canvasHeight,
    columns,
    rows,
    vertical,
    margin,
    gap
  ] = getLayout();

  sheetCanvas.width = canvasWidth;
  sheetCanvas.height = canvasHeight;

  sheetContext.fillStyle = "#ffffff";

  sheetContext.fillRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  const footerHeight =
    S.paper === "a4" ? 44 : 48;

  const stickerWidth =
    (
      canvasWidth -
      margin * 2 -
      (columns - 1) * gap
    ) /
    columns;

  const stickerHeight =
    (
      canvasHeight -
      margin * 2 -
      footerHeight -
      (rows - 1) * gap
    ) /
    rows;

  for (
    let row = 0;
    row < rows;
    row += 1
  ) {
    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      drawSticker(
        sheetContext,
        margin +
          column *
          (stickerWidth + gap),
        margin +
          row *
          (stickerHeight + gap),
        stickerWidth,
        stickerHeight,
        vertical
      );
    }
  }

  sheetContext.save();

  sheetContext.fillStyle = "#8f818b";
  sheetContext.textAlign = "center";
  sheetContext.textBaseline = "middle";

  sheetContext.font =
    `500 ${
      S.paper === "a4" ? 18 : 20
    }px "Noto Sans TC", sans-serif`;

  sheetContext.fillText(
    "© 2026 Feixin Kids · Design · Download · Print",
    canvasWidth / 2,
    canvasHeight - margin / 2
  );

  sheetContext.restore();

  $("#meta").textContent =
    `${S.paper === "a4" ? "A4" : "4×6"} · ` +
    `${S.qty} 張`;
  
  drawMobileStickerPreview();
}

function downloadFile(url, fileName) {
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

$("#pngBtn").addEventListener(
  "click",
  async () => {
    await document.fonts.ready;
    await ensureFontLoaded(S.font);

    drawSheet();

    downloadFile(
      sheetCanvas.toDataURL("image/png"),
      "feixin-kids-name-sticker.png"
    );

    $("#exportStatus").textContent =
      "PNG 已產生。";
  }
);

$("#pdfBtn").addEventListener(
  "click",
  async () => {
    await document.fonts.ready;
    await ensureFontLoaded(S.font);

    drawSheet();

    if (!window.jspdf) {
      $("#exportStatus").textContent =
        "PDF 元件尚未載入。";

      return;
    }

    const isA4 = S.paper === "a4";

    const pdf =
      new window.jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: isA4
          ? "a4"
          : [101.6, 152.4]
      });

    pdf.addImage(
      sheetCanvas.toDataURL(
        "image/jpeg",
        0.96
      ),
      "JPEG",
      0,
      0,
      isA4 ? 210 : 101.6,
      isA4 ? 297 : 152.4
    );

    pdf.save(
      "feixin-kids-name-sticker.pdf"
    );

    $("#exportStatus").textContent =
      "PDF 已產生。";
  }
);

$("#nameInput").addEventListener(
  "input",
  (event) => {
    S.name =
      event.target.value || " ";

    drawSheet();
  }
);

$("#textColor").addEventListener(
  "input",
  (event) => {
    S.color = event.target.value;
    drawSheet();
  }
);

$("#fontSizeRange").addEventListener(
  "input",
  (event) => {
    S.fontScale =
      Number(event.target.value) / 100;

    $("#fontSizeValue").textContent =
      `${event.target.value}%`;

    drawSheet();
  }
);

$("#textOutline").addEventListener(
  "change",
  (event) => {
    S.outline = event.target.checked;
    drawSheet();
  }
);

$$("#paperTabs button").forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        setPaper(
          button.dataset.paper
        );
      }
    );
  }
);

$("#resetBtn").addEventListener(
  "click",
  async () => {
    if (S.url) {
      URL.revokeObjectURL(S.url);
    }

    Object.assign(S, {
      name: "林小可",
      font: 0,
      fontScale: 1,
      color: "#4b3b52",
      outline: true,
      theme: "car",
      paper: "a4",
      qty: 24,
      img: null,
      url: null,
      crop: {
        x: 0,
        y: 0,
        scale: 1
      }
    });

    $("#nameInput").value = S.name;
    $("#textColor").value = S.color;

    $("#fontSizeRange").value = 100;
    $("#fontSizeValue").textContent =
      "100%";

    $("#textOutline").checked = true;
    $("#photoInput").value = "";
    $("#photoTools").hidden = true;

    cropContext.clearRect(
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    await ensureFontLoaded(0);

    setPaper("a4");
    renderFonts();
    renderFilters();
    renderThemes();
    drawSheet();

    updateFontButtonStatus();

    $("#exportStatus").textContent = "";
  }
);

async function preloadFonts() {
  await Promise.allSettled(
    fonts.map(
      (_, index) =>
        ensureFontLoaded(index)
    )
  );
}

async function initializeStickerTool() {
  renderFonts();
  renderFilters();
  renderThemes();
  renderQty();

  drawSheet();

  await document.fonts.ready;
  await preloadFonts();

  drawSheet();
  updateFontButtonStatus();
}


const mobilePreviewButton =
  document.querySelector("#mobilePreviewBtn");
const mobileStickerCanvas =
  document.querySelector("#mobileStickerCanvas");

const mobileStickerContext =
  mobileStickerCanvas?.getContext("2d");

const mobilePreviewModal =
  document.querySelector("#mobilePreviewModal");

const closeMobilePreviewButton =
  document.querySelector("#closeMobilePreviewBtn");

const mobilePreviewContent =
  document.querySelector("#mobilePreviewContent");

const previewSection =
  document.querySelector(".preview");

const previewPlaceholder =
  document.createComment("preview-original-position");
function drawMobileStickerPreview() {
  if (
    !mobileStickerCanvas ||
    !mobileStickerContext
  ) {
    return;
  }

  const width = 320;
  const height = 130;
  const padding = 8;

  mobileStickerCanvas.width = width;
  mobileStickerCanvas.height = height;

  mobileStickerContext.clearRect(
    0,
    0,
    width,
    height
  );

  mobileStickerContext.fillStyle = "#ffffff";

  mobileStickerContext.fillRect(
    0,
    0,
    width,
    height
  );

  drawSticker(
    mobileStickerContext,
    padding,
    padding,
    width - padding * 2,
    height - padding * 2,
    false
  );
}

function openMobilePreview() {
  if (
    !mobilePreviewModal ||
    !mobilePreviewContent ||
    !previewSection
  ) {
    return;
  }

  previewSection.parentNode.insertBefore(
    previewPlaceholder,
    previewSection
  );

  mobilePreviewContent.appendChild(
    previewSection
  );

  mobilePreviewModal.hidden = false;

  document.body.classList.add(
    "mobile-preview-open"
  );

  drawSheet();

  mobilePreviewContent.scrollTop = 0;
}

function closeMobilePreview() {
  if (
    !mobilePreviewModal ||
    !previewSection ||
    !previewPlaceholder.parentNode
  ) {
    return;
  }

  previewPlaceholder.parentNode.insertBefore(
    previewSection,
    previewPlaceholder
  );

  previewPlaceholder.remove();

  mobilePreviewModal.hidden = true;

  document.body.classList.remove(
    "mobile-preview-open"
  );
}

mobilePreviewButton?.addEventListener(
  "click",
  openMobilePreview
);

closeMobilePreviewButton?.addEventListener(
  "click",
  closeMobilePreview
);

mobilePreviewModal?.addEventListener(
  "click",
  (event) => {
    if (event.target === mobilePreviewModal) {
      closeMobilePreview();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      mobilePreviewModal &&
      !mobilePreviewModal.hidden
    ) {
      closeMobilePreview();
    }
  }
);

window.addEventListener(
  "resize",
  () => {
    if (
      window.innerWidth > 980 &&
      mobilePreviewModal &&
      !mobilePreviewModal.hidden
    ) {
      closeMobilePreview();
    }
  }
);

initializeStickerTool();
