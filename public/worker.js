importScripts('imageCompression.js');

onmessage = (e) => {
    let { data } = e;
    if (data.action === 'createBMP') {
        const bmp = createBMP(data.imageData)
        postMessage({
            action: "createdBMP",
            imageSource: bmp
        });
    }
}
