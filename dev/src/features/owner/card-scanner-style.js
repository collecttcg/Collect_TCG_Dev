export function register(){
  if(typeof document==="undefined"||document.getElementById("aiCardScannerStyles"))return;
  const link=document.createElement("link");
  link.id="aiCardScannerStyles";
  link.rel="stylesheet";
  link.href="./src/styles/30-ai-card-scanner.css?v=2026-10-25-v02";
  document.head.appendChild(link);
}
