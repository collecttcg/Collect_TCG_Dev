/** Owner pricing extension: keep normal FX conversion for lower-priced MYR listings. */
export function register(appContext){
  const roundedConvertedPriceValue=appContext.convertedPriceValue;

  function convertedPriceValue(amount,rate){
    const myr=Number(amount);
    const fx=Number(rate);
    if(!Number.isFinite(myr) || myr<0 || !Number.isFinite(fx) || fx<0) return "";

    const raw=myr*fx;
    if(myr<appContext.FX_NORMAL_CONVERSION_BELOW_MYR){
      // Normal conversion for lower-priced cards: round the current FX result
      // to the nearest whole USD/SGD amount without applying the 50-unit step.
      return String(Math.round(raw));
    }

    return roundedConvertedPriceValue(amount,rate);
  }

  const originalUpdateFxRateStatus=appContext.updateFxRateStatus;
  function updateFxRateStatus(p,rates,message=""){
    originalUpdateFxRateStatus(p,rates,message);
    if(message || !rates) return;
    const text=appContext.$(p+"FxRateText");
    if(!text) return;
    text.textContent=text.textContent.replace(
      "auto prices never round down; round up to 50, or up to the next 100",
      `below RM ${appContext.FX_NORMAL_CONVERSION_BELOW_MYR}: normal conversion rounded to whole number; RM ${appContext.FX_NORMAL_CONVERSION_BELOW_MYR}+: never round down, round up to 50, or up to the next 100`
    );
  }

  Object.assign(appContext,{convertedPriceValue,updateFxRateStatus});
}

export function initialize(appContext){
  appContext.FX_NORMAL_CONVERSION_BELOW_MYR=400;
}
