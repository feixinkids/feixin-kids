const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const fonts = [
  {
    name: "圓潤預設",
    family: '"M PLUS Rounded 1c", "Noto Sans TC", sans-serif',
    loadName: "M PLUS Rounded 1c"
  },
  {
    name: "貓啃珠圓",
    family: '"MaokenZhuyuan", "Noto Sans TC", sans-serif',
    loadName: "MaokenZhuyuan"
  },
  {
    name: "悠哉手寫",
    family: '"Yozai", "Noto Sans TC", sans-serif',
    loadName: "Yozai"
  },
  {
    name: "輕鬆圓體",
    family: '"Chill", "Noto Sans TC", sans-serif',
    loadName: "Chill"
  },
  {
    name: "微笑字體",
    family: '"Smiley", "Noto Sans TC", sans-serif',
    loadName: "Smiley"
  },
  {
    name: "楓糖圓體",
    family: '"Maple", "Noto Sans TC", sans-serif',
    loadName: "Maple"
  },
  {
    name: "辰宇手寫",
    family: '"ChenYu", "Noto Sans TC", sans-serif',
    loadName: "ChenYu"
  },
  {
    name: "粉圓字體",
    family: '"Huninn", "Noto Sans TC", sans-serif',
    loadName: "Huninn"
  }
];

const themes = window.FeixinTemplateData.templates;
const solidBackgrounds = window.FeixinTemplateData.solidBackgrounds;

const savedProfile = window.FeixinSharedData?.read() || {};
const S = {
  name: savedProfile.chineseName || "林小可",
  english: savedProfile.englishName || "Cathy",
  className: savedProfile.className || "維也納班",
  font: 0,
  fontScale: 1,
  color: "#4b3b52",
  outline: true,
  theme: "excavator",
  backgroundMode: "template",
  solidBackground: "macaron-pink",
  gradient: false,
  paper: "a4",
  qty: 48,
  usePhoto: true,
  photoShape: "circle",
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
      <span class="font-display-name" style='font-family:${font.family}'>${font.name}</span>
    </button>
  `;
}

async function ensureFontLoaded(index) {
  const fontFamily = fonts[index].loadName;

  try {
    await document.fonts.load(
      `800 48px "${fontFamily}"`,
      "林小可"
    );
  } catch (error) {
    console.warn(
      `字體載入失敗：${fontFamily}`,
      error
    );
  }
}

function updateFontButtonStatus() {
  $$(".font-btn").forEach((button, index) => {
    const fontFamily = fonts[index].loadName;

    const loaded = document.fonts.check(
      `24px "${fontFamily}"`,
      "林小可"
    );

    button.title = loaded
      ? "字體已載入"
      : "字體尚未載入，將使用替代字體";

    button.classList.toggle(
      "font-missing",
      !loaded
    );
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
  document.querySelectorAll("[data-bg-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bgMode === S.backgroundMode);
  });
  const solidOptions = $("#solidOptions");
  if (solidOptions) solidOptions.hidden = S.backgroundMode !== "solid";
}

function renderThemes() {
  const items = S.backgroundMode === "template" ? themes : solidBackgrounds;
  $("#backgroundGrid").innerHTML = items.map((item) => {
    const active = S.backgroundMode === "template" ? item[0] === S.theme : item[0] === S.solidBackground;
    const swatchStyle = S.backgroundMode === "template"
      ? `background:${item[2]}`
      : `background:${S.gradient ? `linear-gradient(135deg, ${item[2]}, #fff)` : item[2]}`;
    return `
      <button class="bg-btn ${active ? "active" : ""}" data-bg-id="${item[0]}" type="button">
        <span class="swatch" style="${swatchStyle}">${S.backgroundMode === "template" ? `<img src="${item[4]}" alt="" loading="lazy">` : ""}</span>
        <span>${item[1]}</span>
      </button>`;
  }).join("");

  $$("[data-bg-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (S.backgroundMode === "template") S.theme = button.dataset.bgId;
      else S.solidBackground = button.dataset.bgId;
      renderThemes();
      drawSheet();
    });
  });
}

function stickerSizeLabel(paper, quantity) {
  const sizes = {
    a4: {
      48: "約 4.6 × 2.0 cm",
      96: "約 3.0 × 1.5 cm",
      102: "約 3.0 × 1.4 cm"
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
    ? [48, 96, 102]
    : [16, 20, 24];

  if (!quantities.includes(S.qty)) {
    S.qty = quantities[0];
  }

  const labelMap = {
    48: "彩之舞 48 格",
    96: "彩之舞 96 格",
    102: "彩之舞 102 格"
  };

  $("#quantities").innerHTML = quantities
    .map((quantity) => `
      <button class="${quantity === S.qty ? "active" : ""}" data-n="${quantity}" type="button">
        ${S.paper === "a4" ? labelMap[quantity] : `${quantity} 張`}
        <small>${S.paper === "a4" ? `單張貼紙 ${stickerSizeLabel(S.paper, quantity)}` : `單張貼紙 ${stickerSizeLabel(S.paper, quantity)}`}</small>
      </button>
    `).join("");

  $$("#quantities button").forEach((button) => {
    button.addEventListener("click", () => {
      S.qty = Number(button.dataset.n);
      renderQty();
      drawSheet();
    });
  });

  $("#layoutHint").textContent = S.paper === "a4"
    ? "目前最佳化支援彩之舞 48／96／102 格預裁切姓名貼紙。其他品牌刀模可能不同。"
    : "使用 4×6 貼紙至超商列印，完成後需自行裁切。";
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

document.querySelectorAll("[data-bg-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    S.backgroundMode = button.dataset.bgMode;
    renderFilters();
    renderThemes();
    drawSheet();
  });
});

$("#gradientToggle")?.addEventListener("change", (event) => {
  S.gradient = event.target.checked;
  renderThemes();
  drawSheet();
});

$("#usePhoto").addEventListener("change", (event) => {
  S.usePhoto = event.target.checked;
  $("#photoSettingPanel").classList.toggle("photo-disabled", !S.usePhoto);
  drawSheet();
});

$$("#photoShapeButtons button").forEach((button) => {
  button.addEventListener("click", () => {
    S.photoShape = button.dataset.shape;
    $$("#photoShapeButtons button").forEach((item) => item.classList.toggle("active", item === button));
    drawSheet();
  });
});

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
const fontFamily = fonts[S.font].family;
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

const themeImageCache = new Map();

function getThemeImage(theme) {
  const src = theme?.[4];
  if (!src) return null;
  if (!themeImageCache.has(src)) {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => drawSheet();
    image.src = src;
    themeImageCache.set(src, image);
  }
  return themeImageCache.get(src);
}

function drawThemeImage(context, image, centerX, centerY, boxSize) {
  if (!image || !image.complete || !image.naturalWidth) return;
  const scale = Math.min(boxSize / image.naturalWidth, boxSize / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, centerX - width / 2, centerY - height / 2, width, height);
}

function getSolidColor() {
  return solidBackgrounds.find((item) => item[0] === S.solidBackground)?.[2] || "#F8DDE7";
}

function drawDecoration(context, theme, x, y, width, height) {
  if (S.backgroundMode === "solid") {
    const color = getSolidColor();
    if (S.gradient) {
      const gradient = context.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "#ffffff");
      context.fillStyle = gradient;
    } else {
      context.fillStyle = color;
    }
    context.fillRect(x, y, width, height);
    return;
  }

  context.fillStyle = theme[2];
  context.fillRect(x, y, width, height);
  const decorationSize = Math.min(width, height) * 0.88;
  const image = getThemeImage(theme);
  context.save();
  context.globalAlpha = 0.26;
  drawThemeImage(context, image, x + width * 0.16, y + height * 0.25, decorationSize);
  drawThemeImage(context, image, x + width * 0.84, y + height * 0.75, decorationSize);
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

  const secondaryText = [S.english, S.className].filter(Boolean).join(" ・ ");

  if (S.usePhoto) {
    const croppedImage = createCroppedImage();
    let imageSize, imageX, imageY;

    if (vertical) {
      imageSize = Math.min(width * 0.58, height * 0.54);
      imageX = x + (width - imageSize) / 2;
      imageY = y + height * 0.07;
    } else {
      imageSize = Math.min(height * 0.72, width * 0.34);
      imageX = x + width * 0.06;
      imageY = y + (height - imageSize) / 2;
    }

    context.save();
    if (S.photoShape === "square") {
      roundedRect(context, imageX, imageY, imageSize, imageSize, imageSize * 0.18);
    } else {
      context.beginPath();
      context.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2, 0, Math.PI * 2);
      context.closePath();
    }
    context.clip();

    if (S.img) {
      context.drawImage(croppedImage, imageX, imageY, imageSize, imageSize);
    } else {
      context.fillStyle = "#ffffffbb";
      context.fillRect(imageX, imageY, imageSize, imageSize);
    }
    context.restore();

    context.strokeStyle = "#ffffff";
    context.lineWidth = Math.max(3, imageSize * 0.04);
    if (S.photoShape === "square") {
      roundedRect(context, imageX + context.lineWidth / 2, imageY + context.lineWidth / 2, imageSize - context.lineWidth, imageSize - context.lineWidth, imageSize * 0.18);
    } else {
      context.beginPath();
      context.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 - context.lineWidth / 2, 0, Math.PI * 2);
    }
    context.stroke();

    if (vertical) {
      drawStickerText(context, S.name, x + width / 2, y + height * (secondaryText ? 0.76 : 0.82), width * 0.82, height * 0.14);
      if (secondaryText) drawStickerText(context, secondaryText, x + width / 2, y + height * 0.89, width * 0.84, height * 0.075);
    } else {
      const remainingWidth = width - (imageX - x) - imageSize;
      const textX = imageX + imageSize + remainingWidth * 0.48;
      drawStickerText(context, S.name, textX, y + height * (secondaryText ? 0.43 : 0.5), remainingWidth - width * 0.08, height * 0.21);
      if (secondaryText) drawStickerText(context, secondaryText, textX, y + height * 0.68, remainingWidth - width * 0.08, height * 0.095);
    }
  } else {
    drawStickerText(context, S.name, x + width / 2, y + height * (secondaryText ? 0.43 : 0.5), width * 0.82, height * 0.27);
    if (secondaryText) drawStickerText(context, secondaryText, x + width / 2, y + height * 0.66, width * 0.84, height * 0.11);
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
      48: [4, 12],
      96: [6, 16],
      102: [6, 17]
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
    `${S.paper === "a4" ? "彩之舞" : "4×6 貼紙"} · ` +
    `${S.qty} ${S.paper === "a4" ? "格" : "張"}`;
  
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

    if (!window.jspdf?.jsPDF) {
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

function saveSharedProfile() {
  window.FeixinSharedData?.write({ chineseName: S.name.trim(), englishName: S.english.trim(), className: S.className.trim() });
}
$("#nameInput").addEventListener("input", saveSharedProfile);
$("#englishInput").addEventListener("input", (event) => { S.english = event.target.value; saveSharedProfile(); drawSheet(); });
$("#classInput").addEventListener("input", (event) => { S.className = event.target.value; saveSharedProfile(); drawSheet(); });

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
      english: "Cathy",
      className: "維也納班",
      font: 0,
      fontScale: 1,
      color: "#4b3b52",
      outline: true,
      theme: "excavator",
      backgroundMode: "template",
      solidBackground: "macaron-pink",
      gradient: false,
      paper: "a4",
      qty: 48,
      usePhoto: true,
      photoShape: "circle",
      img: null,
      url: null,
      crop: {
        x: 0,
        y: 0,
        scale: 1
      }
    });

    $("#nameInput").value = S.name;
    $("#englishInput").value = S.english;
    $("#classInput").value = S.className;
    saveSharedProfile();
    $("#textColor").value = S.color;

    $("#usePhoto").checked = true;
    $("#photoSettingPanel").classList.remove("photo-disabled");
    $$("#photoShapeButtons button").forEach((button) => button.classList.toggle("active", button.dataset.shape === "circle"));
    $("#fontSizeRange").value = 100;
    $("#fontSizeValue").textContent =
      "100%";

    $("#textOutline").checked = true;
    if ($("#gradientToggle")) $("#gradientToggle").checked = false;
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
  const mobileCanvas =
    document.getElementById(
      "mobileStickerCanvas"
    );

  if (!mobileCanvas) {
    return;
  }

  const context =
    mobileCanvas.getContext("2d");

  const width = mobileCanvas.width;
  const height = mobileCanvas.height;

  context.clearRect(
    0,
    0,
    width,
    height
  );

  const padding = 8;

  drawSticker(
    context,
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

  
$("#nameInput").value = S.name;
$("#englishInput").value = S.english;
$("#classInput").value = S.className;
drawSheet();

  requestAnimationFrame(() => {
    mobilePreviewContent.scrollTo({ top: 0, behavior: "instant" });
    previewSection.scrollIntoView({ block: "start", behavior: "instant" });
  });
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
