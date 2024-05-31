let dtImages, lienzo;
let inProcessImage = [];

onload(() => {
    lienzo = canvasPreview.getContext("2d");
    dtImages = initDataTable("#tblImages", true, {
        paging: false,
        searchable: false,
        sortable: false,
        columns: [{
            select: 0,
            type: "number",
            render: (value, cell, dataIndex, _cellIndex) => {
                if (dtImages.data.data.length == 0) return;
                value = dataIndex + 1;
                cell.childNodes = [{
                    nodeName: "SPAN",
                    childNodes: [{
                        nodeName: "#text",
                        data: value
                    }, {
                        nodeName: "BUTTON",
                        attributes: {
                            "data-row": dataIndex,
                            onclick: "moveLayer(this, -1)",
                            style: (dataIndex == 0 ? "display: none;" : "")
                        },
                        childNodes: [{
                            nodeName: "#text",
                            data: "🔺"
                        }]
                    }, {
                        nodeName: "BUTTON",
                        attributes: {
                            "data-row": dataIndex,
                            onclick: "moveLayer(this, 1)",
                            style: (dataIndex == dtImages.data.data.length - 1 ? "display: none;" : "")
                        },
                        childNodes: [{
                            nodeName: "#text",
                            data: "🔻"
                        }]
                    }]
                }]
            }
        }, {
            select: 1,
            type: "other",
            render: (value, cell, dataIndex, _cellIndex) => {
                cell.childNodes = [{
                    nodeName: "IMG",
                    attributes: {
                        height: "20px",
                        src: value.base64,
                        title: value.file.name
                    }
                }]
            }
        }, {
            select: [2, 3, 4, 5],
            type: "number"
        }]
    }, { csv: false });
    dtImages.on('datatable.update', () => {
        canvasPreview.width = widthCanva.value;
        canvasPreview.height = heightCanva.value;
        lienzo.clearRect(0, 0, canvasPreview.clientWidth, canvasPreview.height)
        dtImages.data.data.forEach(row => {
            let image = new Image();
            image.src = row.cells[1].data.base64;
            image.style.transform = "scaleX(-1)";
            lienzo.drawImage(
                image,
                row.cells[2].data,
                row.cells[3].data,
                row.cells[4].data,
                row.cells[5].data
            );
        });
    });

    makeEditableDatatable(dtImages, {
        inputs: [{
            select: [2, 3, 4, 5],
            nodeName: "INPUT",
            attributes: {
                type: "number",
                min: "0"
            }
        }]
    });


});

function addImages() {
    if (fileImages.files.length == 0) return;
    for (file of fileImages.files) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const image = new Image();
            image.onload = function () {
                inProcessImage.push({
                    file: {
                        file: fileImages.files[inProcessImage.length],
                        base64: image.src
                    },
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height
                })
                insertDtImages();
            };
            image.src = e.target.result;
        };

        reader.onerror = function (error) {
            console.error('Error al leer la imagen:', error);
        };

        reader.readAsDataURL(file);
    }
}

function insertDtImages() {
    if (fileImages.files.length != inProcessImage.length) return;
    fileImages.value = "";
    dtImages.insert({
        data: inProcessImage.map(x => [
            null,
            x.file,
            x.x,
            x.y,
            x.width,
            x.height,
        ])
    });
    inProcessImage = [];
}

function moveLayer(btn, move) {
    let oldIndex = parseInt(btn.dataset.row);
    let oldRow = dtImages.data.data[oldIndex];
    let newIndex = parseInt(btn.dataset.row) + move;
    let newRow = dtImages.data.data[newIndex];
    dtImages.data.data[oldIndex] = newRow;
    dtImages.data.data[newIndex] = oldRow;
    dtImages.update();
}