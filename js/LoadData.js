import * as idb from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

export async function SetData(data, URL, page = "Sheet1") {
    try {
        const jsonData = JSON.stringify(data);
        const response = await fetch(URL + '?page=' + encodeURIComponent(page), {
            method: 'POST', 
            body: jsonData,
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' 
            }
        });
        
        // Đọc phản hồi thực tế từ Apps Script
        const result = await response.json(); 
        
        if(result.status === 'success') {
            console.log('Thành công!', result.message);
        } else {
            console.error('Lỗi từ server:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi SetData:', error.message);
    }
}

export async function GetData(URL, page = "Sheet1") {
    try {
        const response = await fetch(URL + '?page=' + encodeURIComponent(page));
        const textData = await response.json();
        return textData; // Trả về dữ liệu đã phân tích
    } catch (error) {
        return [];
    }
}

export class LoadDataForDict {
    constructor(URL, page = "Setup") {
        this.data = {};
        this.URL = URL;
        this.page = page;
        this.oldData = null;
        this.activeTimers = {};
        this.isSaving = false;
        this.loadSheeting = false;
        this.saveTimer = null;
    }

    async init() {
        const getData = await idb.get(this.page);
        if (getData) {
            this.data = JSON.parse(getData)
            this.oldData = getData;
        } else {
            const data = await GetData(this.URL, this.page);
            if (data[0][0] === '') return;
            this.data = Object.fromEntries(data);
            this.save();
        }
    }

    clear() {
        this.data = {};
    }

    save(timeout = 500) {
        // 1. CHỐNG SPAM CLICK/GÕ (Debounce tuyệt hảo của bạn)
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(async () => {
            
            // 2. KHÓA BẢO VỆ MẠNG (Chống 2 cục data tông nhau trên đường truyền)
            if (this.isSaving) {
                console.log("Mạng đang kẹt cục data trước, hẹn lại tí nữa lưu...");
                this.save(timeout); // Gọi lại chính nó để đặt lại đồng hồ
                return;
            }

            // Khóa cửa lại để bắt đầu đẩy data lên mạng
            this.isSaving = true;

            try {
                const dataArray = Object.entries(this.data);
                idb.set(this.page, JSON.stringify(this.data));
                await SetData(dataArray, this.URL, this.page);
            } catch (error) {
                console.error("Lỗi mất mạng khi lưu:", error);
            } finally {
                // Mở khóa cửa (Luôn chạy dù thành công hay lỗi)
                this.isSaving = false; 
            }

        }, timeout);
    }

    remove(key) {
        delete this.data[key];
    }

    get(key) {
        const value = this.data[key];
        return JSON.parse(value);
    }

    set(key, value) {
        this.data[key] = JSON.stringify(value);
    }

    check(key) {
        return key in this.data;
    }

    forEach(callback) {
        for (const [key, value] of Object.entries(this.data)) {
            callback(key, JSON.parse(value));
        }
    }

    addChangeSheetCallback(key, callback, timeout = 2000) {
        if (this.activeTimers[key]) return; 
        
        this.activeTimers[key] = true;

        const poll = async () => {
            // Nếu bị stop hoàn toàn thì mới thoát hàm
            if (!this.activeTimers[key]) return;

            // SỬA LỖI 1: Nếu đang lưu (saving) thì KHÔNG return, chỉ BỎ QUA đoạn lấy dữ liệu
            if (!this.isSaving && !this.loadSheeting && !document.hidden) {
                try {
                    this.loadSheeting = true;
                    const data = await GetData(this.URL, this.page);
                    const newData = Object.fromEntries(data);
                    const newDataString = JSON.stringify(newData);

                    // Xử lý khi có thay đổi thực sự
                    if (newDataString !== this.oldData) {
                        const oldDataObject = JSON.parse(this.oldData);
                        this.oldData = newDataString;
                        this.data = newData;
                        idb.set(this.page, newDataString);
                        callback(this.data, oldDataObject);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    this.loadSheeting = false;
                }
            }

            if (this.activeTimers[key]) setTimeout(poll, timeout);
        };

        poll();
    }
}

const imageUploadURL = 'https://script.google.com/macros/s/AKfycbz0VtXmUmGQkGWvUTWdgqhv0Ovwhk-CqnqY5hxgPOsTAELr5Kpxz4knTjK8pGqXQ5YchA/exec';

export async function uploadImageToDrive(base64String, fileName) {
    const response = await fetch(imageUploadURL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify({
            base64: base64String,
            fileName: fileName
        })
    });

    const result = await response.json();
    if(result.status === 'success') {
        return result.url;
    } else {
        throw new Error(result.message);
    }
}

export async function deleteImageFromDrive(fileId) {
    const response = await fetch(imageUploadURL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify({
            deleteFileId: fileId
        })
    });

    const result = await response.json();
    if(result.status === 'success') {
        return result.message;
    } else {
        throw new Error(result.message);
    }
}
