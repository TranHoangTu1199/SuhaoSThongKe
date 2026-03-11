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

const cols = {
    date: 0,
    sl: 1,
    code: 2,
    name: 3,
    size: 4,
    fashion: 5,
    style: 6,
    image: 7,
    id: 8
}

export class LoadDataForList {
    constructor(URL, page = "Sheet1") {
        this.data = [];
        this.URL = URL;
        this.page = page;
    }

    // Gọi hàm này ngay sau khi khởi tạo class để tải dữ liệu một cách an toàn
    async init() {
        this.data = await GetData(this.URL, this.page);
    }

    insert(index, value) {
        this.data.splice(index, 0, value);
    }

    push(value) {
        this.data.push(value);
    }

    remove(index) {
        this.data.splice(index, 1);
    }

    get(col, row) {
        const rowData = this.data[row];
        if (!rowData) return undefined;

        const colIndex = (typeof col === 'string') ? cols[col] : col;
        return (colIndex !== undefined) ? rowData[colIndex] : undefined;
    }

    set(col, row, value) {
        if (!this.data[row]) return; // Kiểm tra an toàn

        if (typeof col === 'string') {
            const colIndex = cols[col];
            // Sửa lỗi: Kiểm tra rõ ràng với undefined
            if (colIndex !== undefined) {
                this.data[row][colIndex] = value; // Sửa lỗi: dùng colIndex thay vì col
            }
        } else if (typeof col === 'number') {
            this.data[row][col] = value;
        }
    }

    async save() {
        await SetData(this.data, this.URL, this.page);
    }

    clear() {
        this.data = [];
    }
}

export class LoadDataForDict {
    constructor(URL, page = "Setup") {
        this.data = {};
        this.URL = URL;
        this.page = page;
        this.oldData = null;
        this.activeTimers = {};
        this.saving = false;
    }

    async init() {
        const data = await GetData(this.URL, this.page);
        this.data = Object.fromEntries(data);
    }

    clear() {
        this.data = {};
    }

    async save() {
        this.saving = true;
        const dataArray = Object.entries(this.data);
        await SetData(dataArray, this.URL, this.page);
        this.saving = false;
    }

    remove(key) {
        delete this.data[key];
    }

    get(key) {
        const value = this.data[key];
        
        // Kiểm tra nếu giá trị không tồn tại hoặc không phải là string
        if (value === undefined || value === null || typeof value !== 'string') {
            return value;
        }

        // Kiểm tra định dạng JSON
        const isJson = (value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'));

        if (isJson) {
            try {
                return JSON.parse(value);
            } catch (e) {
                console.error('Lỗi khi phân tích JSON tại key:', key, e);
                return value;
            }
        } 
        
        // Xử lý boolean
        if (value === 'TRUE' || value === 'FALSE' || value === 'true' || value === 'false') {
            return value === 'TRUE' || value === 'true';
        }

        return value;
    }

    set(key, value) {
        if (typeof value === 'object') {
            this.data[key] = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
            this.data[key] = value.toString();
        } else {
            this.data[key] = value;
        }
    }

    check(key) {
        return key in this.data;
    }

    forEach(callback) {
        for (const [key, value] of Object.entries(this.data)) {
            callback(key, value);
        }
    }

    addChangeSheetCallback(key, callback, timeout = 500) {
        if (this.activeTimers[key]) return; 
        
        this.activeTimers[key] = true;

        const poll = async () => {
            // Nếu bị stop hoàn toàn thì mới thoát hàm
            if (!this.activeTimers[key]) return;

            // SỬA LỖI 1: Nếu đang lưu (saving) thì KHÔNG return, chỉ BỎ QUA đoạn lấy dữ liệu
            if (!this.saving) { 
                try {
                    const data = await GetData(this.URL, this.page);
                    const newData = Object.fromEntries(data);
                    const newDataString = JSON.stringify(newData);

                    // Xử lý lần gọi đầu tiên
                    if (this.oldData === null) {
                        this.oldData = newDataString;
                        this.data = newData; 
                    } 
                    // Xử lý khi có thay đổi thực sự
                    else if (newDataString !== this.oldData) {
                        this.oldData = newDataString;
                        this.data = newData; 
                        callback(this.data);
                    }
                } catch (error) {
                    // Xuất lý lần gọi đầu tiên
                }
            }

            // Dù lúc nãy có bỏ qua vì đang saving hay không, vẫn phải đặt lịch cho chu kỳ tiếp theo
            if (this.activeTimers[key]) {
                setTimeout(poll, timeout);
            }
        };

        poll();
    }
}

const imageUploadURL = 'https://script.google.com/macros/s/AKfycbz0VtXmUmGQkGWvUTWdgqhv0Ovwhk-CqnqY5hxgPOsTAELr5Kpxz4knTjK8pGqXQ5YchA/exec';

export async function uploadImageToDrive(base64String, fileName) {
    const response = await fetch(imageUploadURL, {
        method: 'POST',
        // Trick: Dùng text/plain để Apps Script không chặn lỗi CORS
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
        // Trick: Dùng text/plain để Apps Script không chặn lỗi CORS
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
