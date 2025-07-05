const KEY = "FAVORITES";

const favStorage = {
    init() {
        if (!localStorage.getItem(KEY)) {
            console.log("CREATING NEW");
            localStorage.setItem(KEY, JSON.stringify([]));
        }
    },
    existsFav(id) {
        const storage = JSON.parse(localStorage.getItem(KEY));
        const exists = storage.some(item => item.id == id);
        return exists;
    },
    setItem(id, img, title) {
        const obj = {
            id: id,
            imgUrl: img,
            title: title
        };
        const storage = JSON.parse(localStorage.getItem(KEY));
        // console.log(obj);
        storage.push(obj);
        localStorage.setItem(KEY, JSON.stringify(storage));
    },
    removeItem(id) {
        const storage = JSON.parse(localStorage.getItem(KEY));
        const index = storage.indexOf(id);
        storage.splice(index, 1);
        localStorage.setItem(KEY, JSON.stringify(storage));
    }
}

export { favStorage };