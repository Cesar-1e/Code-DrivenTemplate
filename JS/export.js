function exportJSON() {
    if(dtImages.data.data.length == 0){
        alert("❌ Error: El contenido de la tabla está totalmente vacío. 📊⚠️");
        return;
    }
    const blob = new Blob([JSON.stringify(dtImages.data.data)], { type: "text/plain" });
    const elementA = document.createElement("a");
    elementA.href = URL.createObjectURL(blob);
    elementA.download = "codeDrivenTemplate.json";
    document.body.appendChild(elementA);
    elementA.click();
    elementA.remove();
}