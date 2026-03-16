import { LoadDataForDict, LoadDataForList, uploadImageToDrive, deleteImageFromDrive } from './js/LoadData.js';
import { LoginUser } from './js/LogUser.js';
//set innit width/height for css
const initWidth = window.innerWidth;
const initHeight = window.innerHeight;
document.documentElement.style.setProperty('--init-width', `${initWidth}px`);
document.documentElement.style.setProperty('--init-height', `${initHeight}px`);

const scriptURL = 'https://script.google.com/macros/s/AKfycbxqzCDnwjefL0MuPdOulqvOUNffSOjAmQgotTa-cdXejZ_8u1o2P-GjOo3lV6s7NJjoyQ/exec';

const addBtnItem = document.querySelector('.add-btn-item');
const setupBtnItem = document.querySelector('.setup-btn-item');
const btnMenu = document.getElementById('btn-menu');
const setupPanel = document.getElementById('setupPanel');
const dateSetupPanel = document.getElementById('date-setup');
const monthSelect = document.getElementById('month-setup');
const yearSelect = document.getElementById('year-setup');
const checkedSetup = document.getElementById('checkbox-boloc');
const stylesSetupContent = document.getElementById('styles-setup-content');
const fashionsSetupContent = document.getElementById('fashions-setup-content');
const stylesSetupAll = document.getElementById('checkbox-style-all');
const fashionsSetupAll = document.getElementById('checkbox-fashion-all');
const stylesSetup = document.getElementById('styles-setup');
const fashionsSetup = document.getElementById('fashions-setup');
const addSpMenu = document.getElementById('addSpMenu');
const addSpMenuAddBtn = document.getElementById('sp-btn-add');
const addSpMenuApplyBtn = document.getElementById('sp-btn-apply');
const addSpMenuCloseBtn = document.getElementById('sp-btn-close');
const addSpItems = document.getElementById('add-sp-items');
const addSpNameInput = document.getElementById('add-sp-name-input');
const addSpSizeInput = document.getElementById('add-sp-size-input');
const addSpCodeInput = document.getElementById('add-sp-code-input');
const addSpDateInput = document.getElementById('add-sp-date-input');
const addSpActorInput = document.getElementById('add-sp-actor-input');
const addSpGroupInput = document.getElementById('add-sp-group-input');
const addSpImageBox = document.getElementById('add-sp-image-box');
const mainPanel = document.getElementById('main');
const loading = document.getElementById('loading');
const loadingBarFill = document.getElementById('loading-bar-fill');
const loadingText = document.getElementById('loading-text');
const addImageBtn = document.getElementById('image-input-bar-btn-add');
const removeImageBtn = document.getElementById('image-input-bar-btn-remove');
const applyImageBtn = document.getElementById('image-input-bar-btn-apply');
const closeImageBtn = document.getElementById('image-input-bar-btn-close');
const loadImageInput = document.getElementById('image-input-item-load');
const imageContents = document.getElementById('image-input-bar-contents');
const imageBar = document.getElementById('image-input-bar');
const searchInput = document.getElementById('search-input');
const imageSearchInput = document.getElementById('image-search-input');
const setUserImg = document.getElementById('edit-user-menu-contents').querySelector('img');

let openPanel = null;
let isVertical = true;
let openSpMenuStyle = "add new";
let loadSetup = false;
let loadSheet = false;
let loadUser = false;
let addImgStyle = 'default';
const tokenKey = 'userToken-SuhaoApp';
let myStorage = {
    token: localStorage.getItem(tokenKey),
    tokenDict: {},

    setToken(key, value) {
        this.tokenDict[key] = value;
        localStorage.setItem(tokenKey, JSON.stringify(this.tokenDict));
    },

    getToken(key) {
        return this.tokenDict[key];
    },

    checkToken(key) {
        return key in this.tokenDict;
    },

    removeToken(key) {
        delete this.tokenDict[key];
        localStorage.setItem(tokenKey, JSON.stringify(this.tokenDict));
    }
}

if (!myStorage.token) {
    localStorage.setItem(tokenKey, '{}');
    myStorage.token = '{}';
    myStorage.tokenDict = {};
} else {
    myStorage.tokenDict = JSON.parse(myStorage.token);
}

const userData = new LoadDataForDict(scriptURL, "User");
const logUserData = new LoginUser(userData, myStorage);
userData.init().then(() => {
    const userName = myStorage.getToken('userName');
    const userPass = myStorage.getToken('userPass');
    logUserData.login(userName, userPass);
    if (logUserData.loging) logUserData.setLogin();
    loadUser = true;
})

function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

// Tạo một Object để lưu trữ các interval ID
const activeTimers = {};

function playRunForTime(func, time, id) {
    // Kiểm tra xem ID này đã được chạy trước đó chưa để tránh việc tạo ra nhiều vòng lặp trùng lặp
    if (activeTimers[id]) { return; }
    activeTimers[id] = setInterval(func, time);
}

function stopRunForTime(id) {
    if (activeTimers[id]) {
        clearInterval(activeTimers[id]);
        delete activeTimers[id];
    } else {
        console.warn(`Không tìm thấy hàm nào đang chạy với ID '${id}'.`);
    }
}

function playRunForTimeToLoop(func, time, loop) {
    // Nếu số lần lặp <= 0 thì không làm gì cả
    if (loop <= 0) return;

    let count = 0; // Biến đếm số lần đã chạy

    // Bắt đầu vòng lặp và lưu ID của nó (cục bộ)
    const intervalId = setInterval(() => {
        func(count, loop);  // Thực thi hàm
        count++; // Tăng biến đếm lên 1

        // Kiểm tra nếu đã chạy đủ số vòng lặp
        if (count >= loop) {
            clearInterval(intervalId);
        }
    }, time);
}

function openLoadingBar() {
    loading.style.display = 'flex';
}

function closeLoadingBar() {
    loading.style.display = 'none';
    setLoadingBarValue(0);
}

function setLoadingBarValue(value, text = '') {
    loadingBarFill.style.width = `${value}%`;
    loadingText.innerText = `${text}${value}%`;
}

function checkSearch(item) {
    const search = searchInput.value.toLowerCase().trim();
    // Đã fix lỗi logic
    if (search === '') return true;

    if (search[0] === '#') {
        const getCode = item.querySelector('.main-item-code')?.textContent.toLowerCase() || '';
        return getCode.includes(search);
    } else {
        const getName = item.querySelector('.main-item-name')?.textContent.toLowerCase() || '';
        return getName.includes(search);
    }
}

// Chuyển việc nhận cấu hình lọc (filterConfig) vào tham số
function checkFilter(item, filterConfig) {
    if (filterConfig.isActive) {
        const spid = item.getAttribute('spid');
        const dict = sheetData.get(spid);
        
        // Phòng thủ: Nếu không có dữ liệu dict hoặc date, tự động bỏ qua item này
        if (!dict || !dict.date) return false;

        const date = dict.date.split('-');
        const year = date[0];
        const month = date[1];
        
        const fashion = dict.actor;
        const style = dict.group;

        return String(month).padStart(2, '0') === filterConfig.targetMonth
            && String(year) === filterConfig.targetYear // Đã fix toString thành String
            && filterConfig.fashions.includes(fashion)
            && filterConfig.styles.includes(style);
    }

    return true;
}

function loadFilterAndSearch() {
    // 1. TÍNH TOÁN CẤU HÌNH LỌC MỘT LẦN DUY NHẤT Ở ĐÂY
    // Chú ý: Hãy chắc chắn toBoolean() ở các bước trước đã xử lý đúng giá trị này
    const isFilterActive = checkedSetup.checked;
    
    let activeStyles = [];
    let activeFashions = [];

    if (isFilterActive) {
        stylesSetupContent.querySelectorAll('input').forEach(item => {
            if (item.checked) activeStyles.push(item.value);
        });
        
        fashionsSetupContent.querySelectorAll('input').forEach(item => {
            if (item.checked) activeFashions.push(item.value);
        });
    }

    // Gom dữ liệu lọc vào một object để truyền đi cho gọn
    const filterConfig = {
        isActive: isFilterActive,
        targetMonth: String(monthSelect.value).padStart(2, '0'),
        targetYear: String(yearSelect.value),
        styles: activeStyles,
        fashions: activeFashions
    };

    // 2. CHẠY VÒNG LẶP CHO TỪNG ITEM
    [...mainPanel.children].forEach(item => {
        // Truyền filterConfig vào để dùng lại, không cần tính toán lại nữa
        const isMatch = checkFilter(item, filterConfig) && checkSearch(item);
        item.classList.toggle('hidden', !isMatch);
    });
}

searchInput.addEventListener('input', loadFilterAndSearch);

const setupData = new LoadDataForDict(scriptURL, "Setup");
const debouncedSave = debounce(() => setupData.save(), 500);

function updateSetupData() {
    if (!setupData.check('years')) {
        setupData.set('years', ["2024", "2025", "2026"]);
    }

    let years = setupData.get('years');
    const newdate = new Date();
    const month = newdate.getMonth() + 1;
    const year = newdate.getFullYear().toString();
    if (!years.includes(year)) {
        years.push(year);
        setupData.set('years', years);
        debouncedSave();
    }

    yearSelect.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    monthSelect.value = month;
    yearSelect.value = year;

    monthSelect.addEventListener('change', loadFilterAndSearch);
    yearSelect.addEventListener('change', loadFilterAndSearch);

    const editDateSetup = dateSetupPanel.querySelector('.editBtn');
    editDateSetup.addEventListener('click', () => {
        openEditMenu(years, (newList) => {
            newList.sort();
            years = newList;
            setupData.set('years', newList);
            debouncedSave();

            // Cập nhật lại yearSelect
            yearSelect.innerHTML = '';
            newList.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            yearSelect.value = year;
        });
    });

    let isChecked = false;
    checkedSetup.addEventListener('change', () => {
        if (checkedSetup.checked !== isChecked) {
            isChecked = checkedSetup.checked;
        }
        loadFilterAndSearch();
    });

    if (!setupData.check('styles')) { setupData.set('styles', []); }
    let stylesData = setupData.get('styles');
    let index = 0;
    stylesSetupContent.innerHTML = '';
    stylesData.forEach(style => {
        addSetupItem(stylesSetupContent, style, 'style', null, index++)
    });

    const editStylesSetup = stylesSetup.querySelector('.editBtn');
    editStylesSetup.addEventListener('click', () => {
        openEditMenu(stylesData, (newList) => {
            stylesData = [...(new Set(newList))];
            stylesData.sort();
            setupData.set('styles', stylesData);
            debouncedSave();
            stylesSetupContent.innerHTML = '';
            let index = 0;
            stylesData.forEach(style => { 
                addSetupItem(stylesSetupContent, style, 'style', null, index++)
            });
        });
    });

    stylesSetupAll.addEventListener('change', () => {
        stylesSetupContent.querySelectorAll('input').forEach(item => {
            item.checked = stylesSetupAll.checked;
        });
        loadFilterAndSearch();
    });

    if (!setupData.check('fashions')) { setupData.set('fashions', []); }
    let fashionsData = setupData.get('fashions');
    index = 0;
    fashionsSetupContent.innerHTML = '';
    fashionsData.forEach(fashion => { 
        addSetupItem(fashionsSetupContent, fashion, 'fashion', null, index++)
    });

    const editFashionsSetup = fashionsSetup.querySelector('.editBtn');
    editFashionsSetup.addEventListener('click', () => {
        openEditMenu(fashionsData, (newList) => {
            fashionsData = [...(new Set(newList))];
            fashionsData.sort();
            setupData.set('fashions', fashionsData);
            debouncedSave();
            fashionsSetupContent.innerHTML = '';
            let index = 0;
            fashionsData.forEach(fashion => { 
                addSetupItem(fashionsSetupContent, fashion, null, index++)
            });
        });
    });

    fashionsSetupAll.addEventListener('change', () => {
        fashionsSetupContent.querySelectorAll('input').forEach(item => {
            item.checked = fashionsSetupAll.checked;
        })
        loadFilterAndSearch();
    });

    loadSetup = true;
}

setupData.init().then(updateSetupData);
setupData.addChangeSheetCallback('Setup', updateSetupData);

const sheetData = new LoadDataForDict(scriptURL, "Sheet1");
const debouncedSaveSheet = debounce(() => sheetData.save(), 500);

function upSheetData() {
    // 1. Tạo một mảng tạm để chứa dữ liệu
    let tempItems = [];
    mainPanel.innerHTML = '';

    // 2. Parse JSON và đẩy toàn bộ dữ liệu vào mảng
    sheetData.forEach((id, itemString) => {
        tempItems.push({
            id: id,
            itemData: JSON.parse(itemString)
        });
    });

    // 3. Sắp xếp mảng theo ngày (item.date)
    tempItems.sort((a, b) => {
        const dateA = new Date(a.itemData.date);
        const dateB = new Date(b.itemData.date);
        return dateA - dateB;
    });

    // 4. Lặp qua mảng đã sắp xếp để in ra màn hình
    tempItems.forEach((obj) => {
        addMainItem(obj.id, obj.itemData);
    });

    closeLoadingBar();
    loadSheet = true;
    resizeEvent();
}

function updateSheetData(newData, oldData) {
    const newKeys = Object.keys(newData);

    newKeys.sort((a, b) => {
        const dateA = new Date(newData[a].date);
        const dateB = new Date(newData[b].date);
        return dateB - dateA;
    });

    const oldIds = [];
    [...mainPanel.children].forEach((item) => {
        const id = item.getAttribute('spid');
        oldIds.push(id);
        if (!newKeys.includes(id)) {
            item.remove();
        }
    });

    document.body.querySelectorAll('main-item-lastbar').forEach((item) => {
        const id = item.getAttribute('spid');
        if (!newKeys.includes(id)) {
            item.remove();
        }
    });

    newKeys.forEach((id) => {
        if (!oldIds.includes(id)) {
            addMainItem(id, JSON.parse(newData[id]));
        } else {
            const oldDataStr = oldData[id];
            const newDataStr = newData[id];
            const newDataObj = JSON.parse(newDataStr);
            if (oldDataStr !== newDataStr) {
                updateMainItem(id, newDataObj);
            }
        }
    });
}

function updateMainItem(id, item) {
    const mainItem = mainPanel.querySelector(`.main-item[spid="${id}"]`); 
    const lastBar = document.querySelector(`.main-item-lastbar[spid="${id}"]`);

    const mainImg = mainItem.querySelector('.main-item-img');
    const lastBarImg = lastBar.querySelector('.main-item-img');
    mainImg.src = item.img;
    lastBarImg.src = item.img;

    const mainName = mainItem.querySelector('.main-item-name');
    const lastBarName = lastBar.querySelector('.main-item-name');
    mainName.textContent = item.name;
    lastBarName.textContent = item.name;

    const sizeloop = item.size.split(/\s*,\s*/).length;
    let loadSL = "";
    let tong = 0;
    for (const [key, value] of Object.entries(item.sl)) {
        loadSL += `- ${key}: ${value} / ${sizeloop * value}<br>`;
        tong += parseInt(value);
    }
    loadSL += `Tổng: ${tong} / ${sizeloop * tong}<br>`;

    const thongtin = `
    Ngày: ${item.date}<br>
    Size: ${item.size}<br><br>
    ${loadSL}<br>
    <span style="font-weight: bold;" class="main-item-code">#${item.code}<br></span>
    <span style="color: red;">- ${item.actor}<br>
    - ${item.group}</span>`;

    const mainThongtin = mainItem.querySelector('.main-item-thongtin');
    const lastBarThongtin = lastBar.querySelector('.main-item-thongtin');
    mainThongtin.innerHTML = thongtin;
    lastBarThongtin.innerHTML = thongtin;

    const cmtPanel = lastBar.querySelector('.main-item-comment-content');
    cmtPanel.innerHTML = "";

    item.cmts.forEach((cmt, index) => {
        addCmtToCmtPanel(cmtPanel, cmt, index);
    });
}

playRunForTime(() => {
    if (loadUser) {
        sheetData.init().then(upSheetData);
        sheetData.addChangeSheetCallback('SheetData', updateSheetData);
        stopRunForTime('loadsheet');
    }
}, 500, 'loadsheet');

const imageDict = new LoadDataForDict(scriptURL, "Image");

function updateImageData() {
    let dateDict = {};
    let dateList = [];
    imageContents.innerHTML = '';
    imageDict.forEach((key, value) => {
        const vl = JSON.parse(value);
        if (!dateDict[vl.date]) { 
            dateDict[vl.date] = [];
            dateList.push(vl.date);
        }
        vl.id = key;
        dateDict[vl.date].push(vl);
    });

    dateList.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
    });

    dateList.forEach((date) => {
        const images = dateDict[date];
        const dateStrFirst = new Date(date).toString().split(' ').slice(0, 1)
        const dateStr = `${dateStrFirst} ${date.split('-').reverse().join('/')}`;
        const dateDiv = document.createElement('div');
        dateDiv.classList.add('image-date-bar');
        dateDiv.setAttribute('data-date', date);
        dateDiv.innerHTML = `<p>${dateStr}</p>`;
        imageContents.appendChild(dateDiv);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('image-content-bar');
        dateDiv.appendChild(contentDiv);

        images.forEach((image) => {
            const imageDiv = document.createElement('div');
            imageDiv.classList.add('image-item-bar');
            imageDiv.title = image.name;
            imageDiv.innerHTML = `<img src="${image.img}" alt="${image.name}">`;
            contentDiv.appendChild(imageDiv);

            const imageName = document.createElement('div');
            imageName.textContent = image.name;
            imageDiv.appendChild(imageName);

            imageName.addEventListener('dblclick', () => {
                imageName.contentEditable = true;
                imageName.classList.add('editable');
            });

            imageName.addEventListener('blur', () => {
                imageName.contentEditable = false;
                image.name = imageName.textContent;
                imageDiv.title = image.name;
                imageDict.set(image.id, image);
                imageDict.save();
                imageName.classList.remove('editable');
            });

            imageName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    imageName.contentEditable = false;
                    image.name = imageName.textContent;
                    imageDiv.title = image.name;
                    imageDict.set(image.id, image);
                    imageDict.save();
                    imageName.classList.remove('editable');
                }
            })

            let pressTimer;
            imageName.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    imageName.contentEditable = true;
                    imageName.classList.add('editable');
                }, 600);
            })

            imageName.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            })

            imageName.addEventListener('touchmove', () => {
                clearTimeout(pressTimer);
            })

            imageDiv.addEventListener('click', () => {
                // Xóa selected class cơ bản
                const selected = document.querySelector('.image-item-bar.selected');
                if (selected) { selected.classList.remove('selected'); }

                imageDiv.classList.add('selected');
            })
        });
    })
}

imageDict.init().then(updateImageData);
imageDict.addChangeSheetCallback('Image', updateImageData);

addImageBtn.addEventListener('click', () => {
    loadImageInput.click();
});

closeImageBtn.addEventListener('click', () => {
    imageBar.style.display = 'none';
});

imageSearchInput.addEventListener('input', () => {
    const searchValue = imageSearchInput.value.toLowerCase();
    const imageItems = document.querySelectorAll('.image-item-bar');
    imageItems.forEach((imageItem) => {
        const imageName = imageItem.title.toLowerCase();
        imageItem.classList.toggle('hidden', !imageName.includes(searchValue));
    });
});

removeImageBtn.addEventListener('click', async () => {
    const selected = document.querySelector('.image-item-bar.selected');
    const alt = selected.querySelector('div').textContent;
    const date = selected.closest('.image-date-bar').getAttribute('data-date');
    const id = `${alt} - ${date}`;
    if (selected) {
        const oldFileIdMatch = selected.querySelector('img').src.match(/[-\w]{25,}/);
        selected.remove();
        imageDict.remove(id);
        imageDict.save();
        if (oldFileIdMatch) {
            await deleteImageFromDrive(oldFileIdMatch[0]);
        }
    }
});

applyImageBtn.addEventListener('click', () => {
    const selected = document.querySelector('.image-item-bar.selected');
    if (selected) {
        if (addImgStyle === 'cmt') {
            const ldiv = document.body.querySelector('.main-item-lastbar[style="display: flex;"]');
            const repBar = ldiv.querySelector('.main-item-rep-bar');
            const limgbar = document.createElement('div');
            repBar.querySelector('.limgbar')?.remove();
            limgbar.classList.add('limgbar');
            repBar.appendChild(limgbar);
            const limg = document.createElement('div');
            limg.classList.add('add-img-to-cmt');
            limg.style.backgroundImage = `url("${selected.querySelector('img').src}")`;
            limgbar.appendChild(limg);
            const removeBtn = document.createElement('div');
            removeBtn.classList.add('remove-img-to-cmt');
            removeBtn.textContent = '✕';
            limg.appendChild(removeBtn);
            removeBtn.addEventListener('click', () => {
                limgbar.remove();
            })
        } else if (addImgStyle === 'default') {
            const img = selected.querySelector('img').src;
            addSpImageBox.src = img;
        } else {
            const img = selected.querySelector('img').src;
            setUserImg.src = img;
        }
    }
    imageBar.style.display = 'none';
})

setUserImg.addEventListener('click', () => {
    imageBar.style.display = 'flex';
    addImgStyle = 'user';
})

loadImageInput.addEventListener('change', async () => {
    const files = loadImageInput.files;
    
    // Nếu người dùng ấn Cancel không chọn ảnh thì dừng lại
    if (files.length === 0) return;
    openLoadingBar();

    const date = new Date().toISOString().split('T')[0];
    const dateStrFirst = new Date(date).toString().split(' ').slice(0, 1)
    const dateStr = `${dateStrFirst} ${date.split('-').reverse().join('/')}`;
    let dateContent = imageContents.querySelector(`[data-date="${date}"]`);
    if (!dateContent) {
        dateContent = document.createElement('div');
        dateContent.classList.add('image-date-bar');
        dateContent.setAttribute('data-date', date);
        dateContent.innerHTML = `<p style="font-size: calc(var(--panel-size) * 0.042); font-weight: normal; font-style: italic;">${dateStr}</p>`;
        imageContents.prepend(dateContent);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('image-content-bar');
        dateContent.appendChild(contentDiv);
    }

    const itemsContent = dateContent.querySelector('.image-content-bar');

    // Lặp qua từng file đã chọn
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingBarValue(0, `Đang xử lý ảnh ${i + 1}/${files.length}... `);

        // Bọc FileReader trong Promise để chờ đọc xong mới đi tiếp
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        if (base64Data && base64Data.startsWith('data:image')) {
            // Chạy hiệu ứng thanh tải
            playRunForTimeToLoop((count) => { 
                setLoadingBarValue(count, `Đang tải ảnh ${i + 1}/${files.length}... - `); 
            }, 100, 100);
            
            // Upload ảnh lên Drive
            const driveUrl = await uploadImageToDrive(base64Data, file.name);
            setLoadingBarValue(100, `Hoàn tất ảnh ${i + 1}... `);
            
            const fileIdMatch = driveUrl.match(/[-\w]{25,}/);
            const imgId = fileIdMatch ? fileIdMatch[0] : '';
            const img = `https://lh3.googleusercontent.com/u/0/d/${imgId}=s400`;

            // Thêm vào dữ liệu
            const newItem = {
                name: file.name,
                img: img,
                date: date,
                id: `${file.name} - ${date}`,
            };

            const imageDiv = document.createElement('div');
            imageDiv.classList.add('image-item-bar');
            imageDiv.title = newItem.name;
            imageDiv.innerHTML = `<img src="${newItem.img}" alt="${newItem.name}">`;
            itemsContent.appendChild(imageDiv);

            const imageName = document.createElement('div');
            imageName.textContent = newItem.name;
            imageDiv.appendChild(imageName);

            imageName.addEventListener('dblclick', () => {
                imageName.contentEditable = true;
                imageName.classList.add('editable');
            });

            imageName.addEventListener('blur', () => {
                imageName.contentEditable = false;
                newItem.name = imageName.textContent;
                imageDiv.title = newItem.name;
                imageDict.set(newItem.id, newItem);
                imageDict.save();
                imageName.classList.remove('editable');
            });

            imageName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    imageName.contentEditable = false;
                    newItem.name = imageName.textContent;
                    imageDiv.title = newItem.name;
                    imageDict.set(newItem.id, newItem);
                    imageDict.save();
                    imageName.classList.remove('editable');
                }
            });

            let pressTimer;
            imageName.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    imageName.contentEditable = true;
                    imageName.classList.add('editable');
                }, 500);
            });

            imageName.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });

            imageName.addEventListener('touchmove', () => {
                clearTimeout(pressTimer);
            });

            imageDiv.addEventListener('click', () => {
                // Xóa selected class cơ bản
                const selected = document.querySelector('.image-item-bar.selected');
                if (selected) { selected.classList.remove('selected'); }

                imageDiv.classList.add('selected');
            })

            imageDict.set(`${newItem.id}`, newItem);
        }
    }

    imageDict.save();
    closeLoadingBar();
    loadImageInput.value = ''; 
});

function resetCmtPanelViewIsOpen() {
    if (isVertical) {
        mainPanel.querySelectorAll('.main-item').forEach(item => {
            item.classList.remove('main-item-row');
            item.classList.add('main-item-col');
        })
    } else {
        mainPanel.querySelectorAll('.main-item').forEach(item => {
            item.classList.remove('main-item-col');
            item.classList.add('main-item-row');
        })
    }
}

function addMainItem(id, item) {
    const div = document.createElement('div');
    div.classList.add('main-item');
    div.setAttribute('spid', id);
    mainPanel.prepend(div);

    const lastBar = document.createElement('div');
    lastBar.classList.add('main-item-lastbar');
    lastBar.setAttribute('spid', id);
    document.body.appendChild(lastBar);

    const firstBar = document.createElement('div');
    firstBar.classList.add('main-item-firstbar');
    div.appendChild(firstBar);

    const img = document.createElement('img');
    img.src = item.img;
    img.loading = "lazy"; 
    img.classList.add('main-item-img');
    firstBar.appendChild(img);

    const content = document.createElement('div');
    content.classList.add('main-item-content');
    firstBar.appendChild(content);

    const name = document.createElement('div');
    name.classList.add('main-item-name');
    name.textContent = item.name;
    content.appendChild(name);

    const sizeloop = item.size.split(/\s*,\s*/).length;
    let loadSL = "";
    let tong = 0;
    for (const [key, value] of Object.entries(item.sl)) {
        loadSL += `- ${key}: ${value} / ${sizeloop * value}<br>`;
        tong += parseInt(value);
    }
    loadSL += `Tổng: ${tong} / ${sizeloop * tong}<br>`;

    const thongtin = document.createElement('div');
    thongtin.classList.add('main-item-thongtin');
    thongtin.innerHTML = `
    Ngày: ${item.date}<br>
    Size: ${item.size}<br><br>
    ${loadSL}<br>
    <span style="font-weight: bold;" class="main-item-code">#${item.code}<br></span>
    <span style="color: red;">- ${item.actor}<br>
    - ${item.group}</span>`;
    content.appendChild(thongtin);

    const btns = document.createElement('div');
    btns.classList.add('main-item-btns');
    content.appendChild(btns);

    const cmtBtn = document.createElement('div');
    cmtBtn.classList.add('main-item-cmt-btn');
    btns.appendChild(cmtBtn);

    const editBtn = document.createElement('div');
    editBtn.classList.add('main-item-edit-btn');
    btns.appendChild(editBtn);

    const deleteBtn = document.createElement('div');
    deleteBtn.classList.add('main-item-delete-btn');
    btns.appendChild(deleteBtn);

    const comment = document.createElement('div');
    comment.classList.add('main-item-comment');
    lastBar.appendChild(comment);

    const commentContent = document.createElement('div');
    commentContent.classList.add('main-item-comment-content');
    commentContent.setAttribute('spid', id);
    comment.appendChild(commentContent);

    item.cmts.forEach((cmt, index) => {
        addCmtToCmtPanel(commentContent, cmt, index);
    })

    const repBar = document.createElement('div');
    repBar.classList.add('main-item-rep-bar');
    comment.appendChild(repBar);

    const inputImgBtn = document.createElement('div');
    inputImgBtn.classList.add('main-item-input-img');
    inputImgBtn.onclick = () => { 
        imageBar.style.display = 'flex';
        const selected = document.querySelector('.image-item-bar.selected');
        if (selected) { selected.classList.remove('selected'); }
        addImgStyle = 'cmt';
    };
    repBar.appendChild(inputImgBtn);

    const repInput = document.createElement('textarea');
    repInput.classList.add('main-item-rep-input');
    repInput.contentEditable = 'true';
    repInput.placeholder = 'Nhập nội dung comment ...';
    repInput.spellcheck = false;
    repInput.rows = 1;
    repBar.appendChild(repInput);

    const repBtn = document.createElement('div');
    repBtn.classList.add('main-item-rep-btn');
    repBar.appendChild(repBtn);

    repInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            repBtn.click();
        }
    });

    repBtn.addEventListener('click', () => {
        if (!logUserData.loging) return;
        const limgbar = document.querySelector('.limgbar');
        const imgForCmt = limgbar?.querySelector('.add-img-to-cmt')?.style?.backgroundImage;
        const imgForCmtUrl = imgForCmt?.match(/url\("(.*)"\)/)[1];
        
        const newCmt = {
            url: imgForCmtUrl || '',
            comment: repInput.value,
            time: new Date().toLocaleString(),
            userID: logUserData.id,
            feels: {}
        }

        addCmtToCmtPanel(commentContent, newCmt, item.cmts.length);

        item.cmts.push(newCmt);
        sheetData.set(id, item);
        sheetData.save();

        repInput.value = '';
        limgbar?.remove();
    })

    let isCmtOpen = false;
    const mainItemCmtEvent = () => {
        isCmtOpen = !isCmtOpen;
        if (!isCmtOpen) {
            lastBar.style.display = 'none';
            mainPanel.style.overflowY = 'auto';
        } else {
            lastBar.style.display = 'flex';
            mainPanel.style.overflowY = 'hidden';
        }
        resetCmtPanelViewIsOpen();
    }

    const mainItemEditEvent = () => {
        openSpMenuStyle = id;
        const item = sheetData.get(id);
        OpenAddSpMenu(item);
    }

    const mainItemDeleteEvent = async () => {
        div.remove();
        lastBar.remove();
        sheetData.remove(id);
        sheetData.save();
        if (img.src && img.src !== 'icon/image.png') {
            const oldFileIdMatch = img.src.match(/[-\w]{25,}/);
            
            if (oldFileIdMatch) {
                console.log("Đang xóa ảnh cũ trên Drive:", oldFileIdMatch[0]);
                await deleteImageFromDrive(oldFileIdMatch[0]);
            }
        }
    }

    cmtBtn.addEventListener('click', mainItemCmtEvent);
    deleteBtn.addEventListener('click', mainItemDeleteEvent);
    editBtn.addEventListener('click', mainItemEditEvent);

    const firstBarClone = firstBar.cloneNode(true);
    lastBar.prepend(firstBarClone);

    firstBarClone.querySelector('.main-item-cmt-btn').addEventListener('click', mainItemCmtEvent);
    firstBarClone.querySelector('.main-item-edit-btn').addEventListener('click', mainItemEditEvent);
    firstBarClone.querySelector('.main-item-delete-btn').style.display = 'none';
}

const activeSetupCmt = document.getElementById('setup-cmt-active');
const editCmt = activeSetupCmt.querySelector('#edit-cmt');
const deleteCmt = activeSetupCmt.querySelector('#delete-cmt');
let openActiveSetupCmt = null;
function openSetupCmtMenu(btn, call) {
    const x = btn.getBoundingClientRect().left;
    const y = btn.getBoundingClientRect().top + btn.getBoundingClientRect().height;
    activeSetupCmt.style.right = `calc(100vw - ${x}px - calc(var(--panel-size) * 0.07))`;
    activeSetupCmt.style.top = `${y}px`;
    activeSetupCmt.style.display = 'flex';
    editCmt.onclick = () => call('edit');
    deleteCmt.onclick = () => call('delete');
}

activeSetupCmt.addEventListener('mouseover', () => {
    clearTimeout(openActiveSetupCmt);
})

activeSetupCmt.addEventListener('mouseout', () => {
    openActiveSetupCmt = setTimeout(() => {
        activeSetupCmt.style.display = 'none';
    }, 100);
})

const editCmtActive = document.getElementById('edit-cmt-active');
const applyEditCmt = editCmtActive.querySelector('.apply');
const closeEditCmt = editCmtActive.querySelector('.close');
const imgEditCmt = editCmtActive.querySelector('img');
const textEditCmt = editCmtActive.querySelector('textarea');
const deleteImgCmt = editCmtActive.querySelector('#delete-image-edit-cmt');
closeEditCmt.addEventListener('click', () => {
    editCmtActive.style.display = 'none';
    document.getElementById('app').inert = false;
})

function openEditCmtMenu(cmt, call) {
    editCmtActive.style.display = 'flex';
    document.getElementById('app').inert = true;
    textEditCmt.value = cmt.comment;

    if (cmt.url.includes('=s400')) {
        deleteImgCmt.style.display = 'flex';
        imgEditCmt.src = cmt.url;
    } else {
        deleteImgCmt.style.display = 'none';
        imgEditCmt.src = '';
    }

    applyEditCmt.addEventListener('click', () => {
        call();
        editCmtActive.style.display = 'none';
        document.getElementById('app').inert = false;
    })
}

function addCmtToCmtPanel(panel, cmt, index) {
    const user = userData.get(cmt.userID);
    const userID = logUserData.id;
    const spid = panel.getAttribute('spid');
    const spData = sheetData.get(spid);
    const avt = user ? user.avt : 'icon/user.png';
    const name = user ? user.username : 'User';

    if (!cmt.id) {
        cmt.id = `cmt-${new Date().getTime()}-${Math.floor(Math.random() * 999)}`
        spData.cmts[index] = cmt;
        sheetData.set(spid, spData);
        sheetData.save();
    }
    
    const cmtDiv = document.createElement('div');
    cmtDiv.classList.add('main-item-cmt');
    cmtDiv.setAttribute('data-id', cmt.id);
    panel.appendChild(cmtDiv);

    const cmtAvt = document.createElement('div');
    cmtAvt.classList.add('main-item-cmt-avt');
    cmtAvt.style.backgroundImage = `url("${avt}")`;
    cmtDiv.appendChild(cmtAvt);

    const cmtContent = document.createElement('div');
    cmtContent.classList.add('main-item-cmt-content');
    cmtDiv.appendChild(cmtContent);

    const cmtNote = document.createElement('div');
    cmtNote.classList.add('main-item-cmt-note');
    cmtContent.appendChild(cmtNote);

    const cmtUser = document.createElement('div');
    cmtUser.classList.add('main-item-cmt-user');
    cmtUser.textContent = name;
    cmtNote.appendChild(cmtUser);

    const cmtTime = document.createElement('div');
    cmtTime.classList.add('main-item-cmt-time');
    cmtTime.textContent = cmt.time;
    cmtNote.appendChild(cmtTime);

    const setupCmt = document.createElement('div');
    setupCmt.classList.add('main-item-cmt-setup');
    setupCmt.textContent = '●●●';
    cmtNote.appendChild(setupCmt);

    let cmtStr = '';
    let cmttext = cmt.comment || '';
    if (cmttext) {
        cmttext = cmttext.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }
    if (cmt.url.includes('=s400')) {
        cmtStr = `<p>${cmttext}</p>
        <img src="${cmt.url}">`;
    } else {
        cmtStr = `<p>${cmttext}</p>`;
    }

    const cmtComment = document.createElement('div');
    cmtComment.classList.add('main-item-cmt-comment');
    cmtComment.innerHTML = cmtStr;
    cmtContent.appendChild(cmtComment);

    let likeUserList = [];
    let disklikeUserList = [];
    if (!cmt.feels) cmt.feels = {};
    for (const [key, value] of Object.entries(cmt.feels)) { 
        // Dùng value === true sẽ an toàn tuyệt đối hơn, đề phòng có giá trị rác lọt vào
        if (value === true) { 
            likeUserList.push(key);
        } else if (value === false) { 
            disklikeUserList.push(key);
        }
    }

    const feelBar = document.createElement('div');
    feelBar.classList.add('main-item-cmt-feel-bar');
    cmtContent.appendChild(feelBar);

    const cmtLike = document.createElement('div');
    cmtLike.classList.add('main-item-cmt-like');
    cmtLike.textContent = `${likeUserList.length}👍`;
    feelBar.appendChild(cmtLike);

    const cmtDisklike = document.createElement('div');
    cmtDisklike.classList.add('main-item-cmt-disklike');
    cmtDisklike.textContent = `${disklikeUserList.length}👎`;
    feelBar.appendChild(cmtDisklike);

    // SỰ KIỆN BẤM LIKE
    cmtLike.addEventListener('click', () => {
        if (cmt.feels[userID] === true) {
            // TRƯỜNG HỢP 1: Đã Like rồi -> Bấm phát nữa là HỦY LIKE
            delete cmt.feels[userID]; // Xóa user khỏi danh sách
            likeUserList = likeUserList.filter(id => id !== userID);
            cmtLike.textContent = `${likeUserList.length}👍`;
        } else {
            // TRƯỜNG HỢP 2: Chưa Like (hoặc đang Dislike) -> CHUYỂN THÀNH LIKE
            if (cmt.feels[userID] === false) {
                // Nếu trước đó đang Dislike thì phải trừ số đếm Dislike đi
                disklikeUserList = disklikeUserList.filter(id => id !== userID);
                cmtDisklike.textContent = `${disklikeUserList.length}👎`;
            }
            
            cmt.feels[userID] = true;
            likeUserList.push(userID);
            cmtLike.textContent = `${likeUserList.length}👍`;
        }

        // Lưu dữ liệu
        spData.cmts[index] = cmt; // Giả sử 'index' đã có ở scope bên ngoài
        sheetData.set(spid, spData);
        debouncedSaveSheet();
    });

    // SỰ KIỆN BẤM DISLIKE
    cmtDisklike.addEventListener('click', () => {
        if (cmt.feels[userID] === false) {
            // TRƯỜNG HỢP 1: Đã Dislike rồi -> Bấm phát nữa là HỦY DISLIKE
            delete cmt.feels[userID];
            disklikeUserList = disklikeUserList.filter(id => id !== userID);
            cmtDisklike.textContent = `${disklikeUserList.length}👎`;
        } else {
            // TRƯỜNG HỢP 2: Chưa Dislike (hoặc đang Like) -> CHUYỂN THÀNH DISLIKE
            if (cmt.feels[userID] === true) {
                // Nếu trước đó đang Like thì phải trừ số đếm Like đi
                likeUserList = likeUserList.filter(id => id !== userID);
                cmtLike.textContent = `${likeUserList.length}👍`;
            }
            
            cmt.feels[userID] = false;
            disklikeUserList.push(userID);
            cmtDisklike.textContent = `${disklikeUserList.length}👎`;
        }

        // Lưu dữ liệu
        spData.cmts[index] = cmt;
        sheetData.set(spid, spData);
        debouncedSaveSheet();
    });

    const setupCmtevent = () => openSetupCmtMenu(setupCmt, (st) => {
        if (st === 'edit') {
            activeSetupCmt.style.display = 'none';
            openEditCmtMenu(cmt, () => {
                let newContent = '';
                let cmttext = textEditCmt.value || '';

                if (cmttext) {
                    cmttext = cmttext.replace(/(?:\r\n|\r|\n)/g, '<br>');
                }

                if (imgEditCmt.src.includes('=s400')) {
                    newContent = `<p>${cmttext}</p>
                    <img src="${imgEditCmt.src}">`;
                    cmt.url = imgEditCmt.src;
                    cmt.comment = cmttext;
                } else {
                    newContent = `<p>${cmttext}</p>`;
                    cmt.comment = cmttext;
                }
                cmtComment.innerHTML = newContent;
                spData.cmts[index] = cmt;
                sheetData.set(spid, spData);
                debouncedSaveSheet();
            })
        } else if (st === 'delete') {
            activeSetupCmt.style.display = 'none';
            cmtDiv.remove();
            spData.cmts.splice(index, 1);
            sheetData.set(spid, spData);
            debouncedSaveSheet();
        }
    });

    setupCmt.addEventListener('mouseover', () => {
        setupCmtevent();
        clearTimeout(openActiveSetupCmt);
    });

    setupCmt.addEventListener('mouseout', () => {
        openActiveSetupCmt = setTimeout(() => {
            activeSetupCmt.style.display = 'none';
        }, 300);
    });
}

function OpenAddSpMenu(setup) {
    addSpMenu.style.display = 'flex';
    document.getElementById('app').inert = true;
    const stylesSetup = setupData.get('styles');
    const fashionsSetup = setupData.get('fashions');
    addSpActorInput.innerHTML = '';
    addSpGroupInput.innerHTML = '';

    stylesSetup.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        addSpGroupInput.appendChild(option);
    });

    fashionsSetup.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        addSpActorInput.appendChild(option);
    });

    if (setup) {
        addSpNameInput.value = setup.name
        addSpSizeInput.value = setup.size
        addSpCodeInput.value = setup.code
        addSpDateInput.value = setup.date
        addSpActorInput.value = setup.actor
        addSpGroupInput.value = setup.group
        addSpImageBox.src = setup.img

        let ifFirst = true;
        addSpItems.innerHTML = '';
        for (const [key, value] of Object.entries(setup.sl)) {
            if (ifFirst) {
                const option = addSpMenu.querySelector('.add-sp-item');
                const optionColor = option.querySelector('input[type="text"]');
                const optionSL = option.querySelector('input[type="number"]');

                optionColor.value = key;
                optionSL.value = value;
                ifFirst = false;
            } else {
                const option = document.createElement('div');
                option.classList.add('add-sp-item');
                option.innerHTML = `
                <input type="text" value="${key}" placeholder="Màu ..." style="flex: 1;"> : 
                <input type="number" value="${value}" style="width: 20%;">`;
                addSpItems.appendChild(option);

                // remove option
                const removeOption = document.createElement('div');
                removeOption.classList.add('remove-btn');
                option.appendChild(removeOption);

                removeOption.addEventListener('click', () => {
                    addSpItems.removeChild(option);
                });
            }
        }
    } else {
        addSpNameInput.value = '';
        addSpSizeInput.value = '';
        addSpCodeInput.value = '0';
        addSpDateInput.value = new Date().toISOString().split('T')[0];
        addSpActorInput.value = fashionsSetup[0];
        addSpGroupInput.value = stylesSetup[0];
        addSpImageBox.src = 'icon/image.png';
        addSpItems.innerHTML = '';

        const option = addSpMenu.querySelector('.add-sp-item');
        const optionColor = option.querySelector('input[type="text"]');
        const optionSL = option.querySelector('input[type="number"]');

        optionColor.value = '';
        optionSL.value = '0';
    }
}

function openPanelEvent() {
    if (openPanel) {
        btnMenu.style.left = 'calc(var(--panel-width) + var(--panel-size) * 0.014)';
    } else {
        btnMenu.style.left = 'calc(var(--panel-size) * 0.007)';
    }

    if (openPanel === 'setup') {
        setupPanel.style.left = 'calc(var(--panel-size) * 0.007)';
        setupBtnItem.style.backgroundColor = '#6bfff3';
    } else {
        setupPanel.style.left = '-100%';
        setupBtnItem.style.backgroundColor = '#6bfff300';
    }
}

function resizeEvent() {
    if (window.innerWidth > window.innerHeight) { isVertical = false; } else { isVertical = true; }

    if (isVertical) {
        const panelSize = window.innerWidth;
        document.documentElement.style.setProperty('--panel-size', `${panelSize}px`);
        document.documentElement.style.setProperty('--sp-menu-size', '100%');
        document.querySelectorAll('.main-item-lastbar').forEach(item => {
            item.classList.add('vertical');
        })
    } else {
        const panelSize = window.innerWidth * 0.35;
        document.documentElement.style.setProperty('--panel-size', `${panelSize}px`);
        document.documentElement.style.setProperty('--sp-menu-size', 'calc(var(--panel-size) * 1.2)');
        document.querySelectorAll('.main-item-lastbar').forEach(item => {
            item.classList.remove('vertical');
        })
    }

    resetCmtPanelViewIsOpen();
}

function addSetupItem(EL, value, key, func, index) {
    const div = document.createElement('div');
    div.classList.add(`checked-${key}s-setup`);
    EL.appendChild(div);
    // id: checkbox-styleEA0099 ...
    const newID = `checkbox-${key}${index}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.id = newID;
    checkbox.checked = false;
    div.appendChild(checkbox);

    const label = document.createElement('label');
    label.textContent = value;
    label.setAttribute('for', newID);
    div.appendChild(label);

    checkbox.addEventListener('change', () => { 
        if (func) func(checkbox);
        loadFilterAndSearch();
    });
}

const editMenu = document.getElementById('editMenu');
const editMenuContent = document.getElementById('edit-menu-contents');
function openEditMenu(list, func) {
    list.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('edit-menu-content-item');
        editMenuContent.appendChild(div);
        const input = document.createElement('input');
        input.value = item;
        div.appendChild(input);
        const deleteBtn = document.createElement('button');
        div.appendChild(deleteBtn);

        // Xóa div
        deleteBtn.addEventListener('click', () => {
            editMenuContent.removeChild(div);
        });
    });

    editMenu.style.display = 'flex';

    const applyBtn = document.getElementById('edit-menu-btn-apply');
    applyBtn.onclick = () => {
        const newList = [];
        editMenuContent.querySelectorAll('input').forEach(input => {
            newList.push(input.value);
        });
        if (func) func(newList);
        editMenu.style.display = 'none';
        editMenuContent.innerHTML = '';
    };
}

addSpImageBox.addEventListener('click', () => {
    imageBar.style.display = 'flex';
    const selected = document.querySelector('.image-item-bar.selected');
    if (selected) { selected.classList.remove('selected'); }
    addImgStyle = 'default';
});

const closeEditMenuBtn = document.getElementById('edit-menu-btn-close');
closeEditMenuBtn.addEventListener('click', () => {
    editMenu.style.display = 'none';
    editMenuContent.innerHTML = '';
});

const addEditMenuBtn = document.getElementById('edit-menu-btn-add');
addEditMenuBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.classList.add('edit-menu-content-item');
    editMenuContent.appendChild(div);
    const input = document.createElement('input');
    div.appendChild(input);
    const deleteBtn = document.createElement('button');
    div.appendChild(deleteBtn);

    // Xóa div
    deleteBtn.addEventListener('click', () => {
        editMenuContent.removeChild(div);
    });
});

setupBtnItem.addEventListener('click', () => {
    if (openPanel !== 'setup') { openPanel = 'setup'; } else { openPanel = null; }
    openPanelEvent()
});

addBtnItem.addEventListener('click', () => {
    openSpMenuStyle = "add new";
    OpenAddSpMenu();
});

addSpMenuCloseBtn.addEventListener('click', async () => {
    addSpMenu.style.display = 'none';
    document.getElementById('app').inert = false;
});

addSpMenuAddBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.classList.add('add-sp-item');
    addSpItems.appendChild(div);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Màu ...';
    input.style.flex = '1';
    div.appendChild(input);

    div.appendChild(document.createTextNode(':'));

    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.value = '0';
    input2.style.width = '20%';
    div.appendChild(input2);

    const removeBtn = document.createElement('div');
    removeBtn.classList.add('remove-btn');
    div.appendChild(removeBtn);

    removeBtn.addEventListener('click', () => {
        addSpItems.removeChild(div);
    });
});

addSpMenuApplyBtn.addEventListener('click', async () => {
    if (openSpMenuStyle === "add new") {
        const date = addSpDateInput.value;
        const actor = addSpActorInput.value;
        const group = addSpGroupInput.value;
        const name = addSpNameInput.value;
        const size = addSpSizeInput.value;
        const code = addSpCodeInput.value;
        const img = addSpImageBox.src;
        const id = `${name} - ${new Date().getTime()}`;

        let sl = {};
        addSpMenu.querySelectorAll('.add-sp-item').forEach(item => {
            const color = item.querySelector('input').value;
            const quantity = item.querySelector('input[type="number"]').value;
            sl[color] = quantity;
        })

        let newItems = {
            date: date,
            actor: actor,
            group: group,
            name: name,
            size: size,
            code: code,
            sl: sl,
            img: img,
            id: id,
            cmts: []
        }

        addMainItem(id, newItems);
        addSpMenu.style.display = 'none';
        document.getElementById('app').inert = false;
        sheetData.set(id, newItems);
        debouncedSaveSheet();
    } else {
        const date = addSpDateInput.value;
        const actor = addSpActorInput.value;
        const group = addSpGroupInput.value;
        const name = addSpNameInput.value;
        const size = addSpSizeInput.value;
        const code = addSpCodeInput.value;
        const img = addSpImageBox.src;
        const id = openSpMenuStyle;

        let sl = {};
        addSpMenu.querySelectorAll('.add-sp-item').forEach(item => {
            const color = item.querySelector('input').value;
            const quantity = item.querySelector('input[type="number"]').value;
            sl[color] = quantity;
        })

        let newItems = {
            date: date,
            actor: actor,
            group: group,
            name: name,
            size: size,
            code: code,
            sl: sl,
            img: img,
            id: id,
            cmts: []
        }

        addSpMenu.style.display = 'none';
        document.getElementById('app').inert = false;
        updateMainItem(id, newItems)
        sheetData.remove(openSpMenuStyle);
        sheetData.set(id, newItems);
        debouncedSaveSheet();
    }
    resizeEvent();
})

document.addEventListener('DOMContentLoaded', () => {
    resizeEvent();
    openLoadingBar();
    
    playRunForTime(() => {
        if (loadSetup && loadSheet) {
            loadFilterAndSearch();
            stopRunForTime('load');
        }
    }, 500, 'load')

    playRunForTimeToLoop((count) => { 
        setLoadingBarValue(count, "Setting up data... ");
    }, 50, 100);
});

window.addEventListener('resize', resizeEvent);
