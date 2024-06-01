function prepareImportJSON() {
    fileJSON.click();
}

function importJSON() {
    if (fileJSON.files.length == 0) return;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        dtImages.insert({
            data: JSON.parse(event.target.result)
        });
        fileJSON.value = "";
        setTimeout(() => {
            dtImages.update();
        }, 1000);
    });
    reader.readAsText(fileJSON.files[0]);
}