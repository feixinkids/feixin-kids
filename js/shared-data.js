(() => {
  const STORAGE_KEY = "feixinKidsProfileV1";
  const DEFAULTS = { chineseName: "林小可", englishName: "Cathy", className: "維也納班" };

  function read() {
    try {
      return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
    } catch (error) {
      console.warn("無法讀取 Feixin Kids 共用資料", error);
      return { ...DEFAULTS };
    }
  }

  function write(patch) {
    const next = { ...read(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("feixin-profile-change", { detail: next }));
    return next;
  }

  window.FeixinSharedData = { read, write, defaults: { ...DEFAULTS } };
})();
