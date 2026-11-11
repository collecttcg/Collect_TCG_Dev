/** Module: features/owner/inventory-value-overview. Adds Available-inventory value to the established Owner Inventory Tools overview. */
export function register(appContext){
  const renderOwnerAlerts=typeof appContext.ownerAlertsDashboardHTML==="function"
    ? appContext.ownerAlertsDashboardHTML.bind(appContext)
    : null;

  function availableInventoryValueSummary(){
    const cards=(Array.isArray(appContext.cards)?appContext.cards:[]).filter(card=>
      appContext.isLiveLifecycle(card) &&
      appContext.normalizeFilterValue(card.availability||"Available")==="available"
    );

    let valueMYR=0;
    let units=0;
    let missingPrice=0;

    cards.forEach(card=>{
      const rawQuantity=Number(card.quantity);
      const quantity=Number.isFinite(rawQuantity) && rawQuantity>0 ? rawQuantity : 1;
      units+=quantity;
      if(appContext.hasListedPrice(card.price_myr)){
        valueMYR+=Number(card.price_myr)*quantity;
      }else{
        missingPrice+=1;
      }
    });

    return {listings:cards.length,units,valueMYR,missingPrice};
  }

  function formatMYR(value){
    try{
      return new Intl.NumberFormat("en-MY",{
        style:"currency",
        currency:"MYR",
        maximumFractionDigits:0
      }).format(Number(value)||0);
    }catch{
      return `MYR ${Math.round(Number(value)||0).toLocaleString()}`;
    }
  }

  if(renderOwnerAlerts){
    appContext.ownerAlertsDashboardHTML=()=>{
      const html=renderOwnerAlerts();
      const summary=availableInventoryValueSummary();
      const note=[
        `${summary.listings} available listings`,
        `${summary.units.toLocaleString()} unit${summary.units===1?"":"s"}`,
        summary.missingPrice ? `${summary.missingPrice} without MYR price` : "MYR prices complete"
      ].join(" · ");
      const overview=`
        <a href="#/inventory" class="owner-inventory-value-card">
          <strong>${appContext.escapeHtml(formatMYR(summary.valueMYR))}</strong>
          <span>Available inventory value</span>
          <small>${appContext.escapeHtml(note)}</small>
        </a>
      `;
      const marker='<div class="owner-alerts-grid">';
      return html.includes(marker) ? html.replace(marker,`${marker}${overview}`) : html;
    };
  }

  appContext.availableInventoryValueSummary=availableInventoryValueSummary;
}

export function initialize(){
  // No initialization required.
}
