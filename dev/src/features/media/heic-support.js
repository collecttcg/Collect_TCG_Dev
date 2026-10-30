/** Owner listing HEIC/HEIF compatibility. Converts Apple HEIC/HEIF uploads to JPEG before the established image pipeline. */
export function register(appContext){
  const originalResizeImageFile=appContext.resizeImageFile?.bind(appContext);
  const originalFieldsTemplate=appContext.fieldsTemplate?.bind(appContext);
  const HEIC_MIMES=new Set(["image/heic","image/heif"]);
  const HEIC_EXTENSIONS=new Set(["heic","heif"]);

  function ownerImageExtension(file){
    return String(file?.name||"").split(".").pop()?.toLowerCase()||"";
  }

  function isHeicOwnerImage(file){
    if(!file) return false;
    const mime=String(file.type||"").trim().toLowerCase();
    const ext=ownerImageExtension(file);
    return HEIC_EXTENSIONS.has(ext) && (HEIC_MIMES.has(mime) || mime==="" || mime==="application/octet-stream");
  }

  async function convertHeicOwnerImage(file){
    if(!appContext.requireOwner("process HEIC card image")) throw new Error("Owner login required");
    if(!file) throw new Error("No image selected");
    if(file.size<=0) throw new Error("Image file is empty");
    if(file.size>appContext.CARD_IMAGE_MAX_BYTES) throw new Error(`Image is too large (max ${Math.round(appContext.CARD_IMAGE_MAX_BYTES/1024/1024)} MB)`);
    if(!isHeicOwnerImage(file)) throw new Error("Unsupported HEIC/HEIF image");
    if(typeof globalThis.heic2any!=="function") throw new Error("HEIC support could not be loaded. Refresh and try again.");

    const converted=await globalThis.heic2any({blob:file,toType:"image/jpeg",quality:0.94});
    const jpegBlob=Array.isArray(converted) ? converted[0] : converted;
    if(!(jpegBlob instanceof Blob) || !jpegBlob.size) throw new Error("Could not convert HEIC image");
    const baseName=String(file.name||"card-photo").replace(/\.(heic|heif)$/i,"")||"card-photo";
    return new File([jpegBlob],`${baseName}.jpg`,{type:"image/jpeg",lastModified:file.lastModified||Date.now()});
  }

  async function resizeImageFileWithHeic(file,...args){
    if(typeof originalResizeImageFile!=="function") throw new Error("Card image processor unavailable");
    const input=isHeicOwnerImage(file) ? await convertHeicOwnerImage(file) : file;
    return originalResizeImageFile(input,...args);
  }

  function fieldsTemplateWithHeic(...args){
    const html=typeof originalFieldsTemplate==="function" ? originalFieldsTemplate(...args) : "";
    return String(html).replaceAll('accept="image/jpeg,image/png,image/webp"','accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"');
  }

  Object.assign(appContext,{isHeicOwnerImage,convertHeicOwnerImage,resizeImageFile:resizeImageFileWithHeic});
  if(typeof originalFieldsTemplate==="function") appContext.fieldsTemplate=fieldsTemplateWithHeic;
}

export function initialize(){}
