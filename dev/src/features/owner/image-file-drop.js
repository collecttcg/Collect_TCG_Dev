/** Owner Add/Edit listing: allow image files to be dropped into the photo area. */
export function register(appContext){
  if(typeof document==="undefined") return;

  const ACTIVE_CLASS="image-file-drop-active";

  function imageFilesFromTransfer(dataTransfer){
    return Array.from(dataTransfer?.files||[]).filter(file=>{
      const type=String(file?.type||"").toLowerCase();
      const name=String(file?.name||"").toLowerCase();
      return type.startsWith("image/") || /\.(?:jpe?g|png|webp|heic|heif)$/.test(name);
    });
  }

  function listingDropZone(target){
    const form=target?.closest?.("#addForm, #editForm");
    if(!form) return null;
    return target.closest(".image-field") || form.querySelector(".image-field");
  }

  function clearDropState(){
    document.querySelectorAll(`.${ACTIVE_CLASS}`).forEach(el=>el.classList.remove(ACTIVE_CLASS));
  }

  document.addEventListener("dragover",event=>{
    const zone=listingDropZone(event.target);
    if(!zone || !event.dataTransfer?.types?.includes("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    clearDropState();
    zone.classList.add(ACTIVE_CLASS);
    event.dataTransfer.dropEffect="copy";
  },true);

  document.addEventListener("dragleave",event=>{
    const zone=listingDropZone(event.target);
    if(!zone) return;
    const next=event.relatedTarget;
    if(!next || !zone.contains(next)) zone.classList.remove(ACTIVE_CLASS);
  },true);

  document.addEventListener("drop",event=>{
    const zone=listingDropZone(event.target);
    if(!zone || !event.dataTransfer?.types?.includes("Files")) return;

    event.preventDefault();
    event.stopPropagation();
    clearDropState();

    if(!appContext.requireOwner("add card image")) return;

    const files=imageFilesFromTransfer(event.dataTransfer);
    if(!files.length){
      appContext.showToast("Drop JPEG, PNG, WebP, HEIC or HEIF image files here.");
      return;
    }

    const form=zone.closest("#addForm, #editForm");
    const prefix=form?.id==="editForm" ? "edit" : "add";
    const input=appContext.$(`${prefix}ImageFile`);
    if(!input || input.disabled){
      appContext.showToast("Please wait for the current image processing to finish.");
      return;
    }

    try{
      const transfer=new DataTransfer();
      files.forEach(file=>transfer.items.add(file));
      input.files=transfer.files;
      input.dispatchEvent(new Event("change",{bubbles:true}));
    }catch(error){
      console.warn("Could not pass dropped listing photos to the image input:",error);
      appContext.showToast("Could not add the dropped photos. Please use Choose Files.");
    }
  },true);

  document.addEventListener("dragend",clearDropState,true);
}

export function initialize(){}
