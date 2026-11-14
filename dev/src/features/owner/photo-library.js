// Both environments use the existing private bucket so saved originals remain available.
const BUCKET = "owner-card-photo-library-dev";
const PAGE_SIZE = 25;

export function wirePhotoLibrary(appContext, dialog, addFiles) {
  const panel = dialog.querySelector("[data-library-panel]");
  const open = dialog.querySelector("[data-library-open]");
  const picker = dialog.querySelector("[data-library-files]");
  const status = dialog.querySelector("[role=status]");
  const list = dialog.querySelector("[data-library-list]");
  const previous = dialog.querySelector("[data-library-previous]");
  const next = dialog.querySelector("[data-library-next]");
  const attach = dialog.querySelector("[data-library-attach]");
  const upload = dialog.querySelector("[data-library-upload]");
  const controls = [picker, previous, next, attach, upload];
  let busy = false;
  let offset = 0;
  let hasNext = false;

  async function load(bucket, position) {
    const {data, error} = await bucket.list("", {
      limit: PAGE_SIZE + 1, offset: position,
      sortBy: {column: "created_at", order: "desc"}
    });
    if (error) throw error;
    offset = position;
    hasNext = data.length > PAGE_SIZE;
    list.replaceChildren();
    for (const file of data.slice(0, PAGE_SIZE)) {
      const label = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.value = file.name;
      check.addEventListener("change", updateControls);
      const filename = file.name.replace(/^[0-9a-f-]{36}--/, "");
      label.append(check, " ", filename);
      const row = document.createElement("div");
      const rename = document.createElement("button");
      rename.type = "button";
      rename.className = "btn-ghost";
      rename.textContent = "Rename";
      rename.setAttribute("aria-label", `Rename ${filename}`);
      rename.addEventListener("click", () => {
        if (busy || !appContext.requireOwner("rename a library photo")) return;
        const extension = filename.slice(filename.lastIndexOf("."));
        const entered = window.prompt("New photo name (file extension is kept)", filename.slice(0, -extension.length));
        if (entered === null) return;
        const stem = entered.trim().replace(/\.(?:jpe?g|png|webp)$/i, "")
          .replace(/[^a-zA-Z0-9_.-]+/g, "-").slice(0, 96);
        if (!stem || !/[a-zA-Z0-9]/.test(stem)) {
          status.textContent = "Enter a name containing a letter or number.";
          return;
        }
        const prefix = file.name.match(/^[0-9a-f-]{36}--/)?.[0] || `${crypto.randomUUID()}--`;
        const destination = `${prefix}${stem}${extension}`;
        if (destination === file.name) return;
        void run("Renaming photo…", async storage => {
          const {error} = await storage.move(file.name, destination);
          if (error) throw error;
          await load(storage, offset);
          status.textContent = `Renamed to ${stem}${extension}.`;
        });
      });
      row.append(label, " ", rename);
      list.append(row);
    }
    status.textContent = data.length ? "Select photos to add to this card." : "No photos saved here yet.";
  }

  function updateControls() {
    for (const control of controls) control.disabled = busy;
    previous.disabled ||= offset === 0;
    next.disabled ||= !hasNext;
    upload.disabled ||= !picker.files.length;
    attach.disabled ||= !list.querySelector("input:checked");
    for (const control of list.querySelectorAll("input, button")) control.disabled = busy;
  }

  async function run(message, operation) {
    if (busy || !appContext.requireOwner("manage the photo library")) return;
    busy = true;
    updateControls();
    status.textContent = message;
    try {
      const bucket = appContext.supabaseClient.storage.from(BUCKET);
      await operation(bucket);
    } catch (error) {
      console.warn("Photo library operation failed:", error);
      status.textContent = "Photo Library action failed. Check storage access and try again.";
    } finally {
      busy = false;
      updateControls();
    }
  }

  open.addEventListener("click", () => {
    if (!appContext.requireOwner("open the photo library")) return;
    panel.hidden = !panel.hidden;
    open.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) void run("Loading photos…", bucket => load(bucket, 0));
  });
  picker.addEventListener("change", updateControls);
  previous.addEventListener("click", () => run("Loading photos…", bucket => load(bucket, offset - PAGE_SIZE)));
  next.addEventListener("click", () => run("Loading photos…", bucket => load(bucket, offset + PAGE_SIZE)));

  upload.addEventListener("click", () => run("Saving originals…", async bucket => {
    const files = Array.from(picker.files);
    const formats = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const valid = [];
    try {
      for (const file of files) {
        const mime = await appContext.validateOwnerImageFile(file, {
          allowedMimes: appContext.SAFE_CARD_IMAGE_MIMES,
          maxBytes: appContext.CARD_IMAGE_MAX_BYTES
        });
        const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]+/g, "-").slice(0, 96);
        valid.push({file, mime, path: `${crypto.randomUUID()}--${stem || "photo"}.${formats[mime]}`});
      }
    } catch (error) {
      status.textContent = error.message;
      return;
    }
    let saved = 0;
    for (const {file, mime, path} of valid) {
      const {error} = await bucket.upload(path, file, {contentType: mime, upsert: false});
      if (error) {
        if (saved) {
          picker.value = "";
          await load(bucket, 0);
          status.textContent = `${saved} of ${files.length} photos saved. Select the remaining files to retry.`;
          return;
        }
        throw error;
      }
      saved++;
    }
    picker.value = "";
    await load(bucket, 0);
    status.textContent = `${saved} photo(s) saved privately.`;
  }));

  attach.addEventListener("click", () => run("Preparing selected photos…", async bucket => {
    const files = [];
    for (const check of list.querySelectorAll("input:checked")) {
      const {data, error} = await bucket.download(check.value);
      if (error) throw error;
      files.push(new File([data], check.value, {type: data.type || ({
        jpg: "image/jpeg", png: "image/png", webp: "image/webp"
      })[check.value.split(".").pop()]}));
    }
    if (!dialog.isConnected || !appContext.requireOwner("add library photos")) return;
    const added = await addFiles(files);
    if (added) {
      for (const check of Array.from(list.querySelectorAll("input:checked")).slice(0, added)) check.checked = false;
    }
    status.textContent = `${added} of ${files.length} photos added to the card preview.`;
  }));
  updateControls();
}
