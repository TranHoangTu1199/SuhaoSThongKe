import { LoadDataForDict, LoadDataForList, uploadImageToDrive, deleteImageFromDrive } from './js/LoadData.js';
//set innit width/height for css
const initWidth = window.innerWidth;
const initHeight = window.innerHeight;
document.documentElement.style.setProperty('--init-width', `${initWidth}px`);
document.documentElement.style.setProperty('--init-height', `${initHeight}px`);

const scriptURL = 'https://script.google.com/macros/s/AKfycbxqzCDnwjefL0MuPdOulqvOUNffSOjAmQgotTa-cdXejZ_8u1o2P-GjOo3lV6s7NJjoyQ/exec';

const addBtnItem = document.querySelector('.add-btn-item');
const setupBtnItem = document.querySelector('.setup-btn-item');
const cmdBtnItem = document.querySelector('.cmd-btn-item');
const btnMenu = document.getElementById('btn-menu');
const setupPanel = document.getElementById('setupPanel');
const dateSetupPanel = document.getElementById('date-setup');
const monthSelect = document.getElementById('month-setup');
const yearSelect = document.getElementById('year-setup');
const cmdPanel = document.getElementById('cmdPanel');
const checkedSetup = document.getElementById('checkbox-boloc');
const stylesSetupContent = document.getElementById('styles-setup-content');
const fashionsSetupContent = document.getElementById('fashions-setup-content');
const stylesSetupAll = document.getElementById('checkbox-style-all');
const fashionsSetupAll = document.getElementById('checkbox-fashion-all');
const stylesSetup = document.getElementById('styles-setup');
const fashionsSetup = document.getElementById('fashions-setup');
const addSpImgBox = document.getElementById('add-sp-image-box');
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

let openPanel = null;
let isVertical = true;
let isCmtOpen = false;
let openSpMenuStyle = "add new";
let loadSetup = false;
let loadSheet = false;
let imgAddCmt = false;
const tokenKey = 'userToken-SuhaoApp';
let token = localStorage.getItem(tokenKey);
let userDict = {};

if (!token) {
    localStorage.setItem(tokenKey, '{}');
} else {
    userDict = JSON.parse(token);
}

function getUserToken(key) {
    return userDict[key];
}

function setUserToken(key, value) {
    userDict[key] = value;
    localStorage.setItem(tokenKey, JSON.stringify(userDict));
}

function checkUserToken(key) {
    return key in userDict;
}

function removeUserToken(key) {
    delete userDict[key];
    localStorage.setItem(tokenKey, JSON.stringify(userDict));
}

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

/**
 * Bắt đầu chạy lặp lại một hàm
 * @param {Function} func - Hàm cần chạy
 * @param {number} time - Thời gian lặp lại (milliseconds)
 * @param {string|number} id - Mã định danh để quản lý
 */
function playRunForTime(func, time, id) {
    // Kiểm tra xem ID này đã được chạy trước đó chưa để tránh việc tạo ra nhiều vòng lặp trùng lặp
    if (activeTimers[id]) { return; }
    activeTimers[id] = setInterval(func, time);
}

/**
 * Dừng chạy hàm
 * @param {string|number} id - Mã định danh của hàm cần dừng
 */
function stopRunForTime(id) {
    if (activeTimers[id]) {
        clearInterval(activeTimers[id]);
        delete activeTimers[id];
    } else {
        console.warn(`Không tìm thấy hàm nào đang chạy với ID '${id}'.`);
    }
}
/**
 * Chạy lặp lại một hàm theo số lần chỉ định rồi tự dừng
 * @param {Function} func - Hàm cần chạy
 * @param {number} time - Thời gian lặp lại (milliseconds)
 * @param {number} loop - Số lần lặp lại
 */
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
        setupData.get('stylesSetup')?.forEach(item => {
            if (item.checked) activeStyles.push(item.value);
        });
        
        setupData.get('fashionsSetup')?.forEach(item => {
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
const debouncedSave = debounce(() => setupData.save(), 1000);

function updateSetupData() {
    if (!setupData.check('dateSetup')) {
        setupData.set('dateSetup', { month: 1, year: 2024, years: [2024, 2025, 2026] });
    }

    const dateSetup = setupData.get('dateSetup');
    yearSelect.innerHTML = '';
    dateSetup.years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    monthSelect.value = dateSetup.month;
    yearSelect.value = dateSetup.year;

    monthSelect.addEventListener('change', () => {
        dateSetup.month = parseInt(monthSelect.value);
        setupData.set('dateSetup', dateSetup);
        loadFilterAndSearch();
        debouncedSave();
    });

    yearSelect.addEventListener('change', () => {
        dateSetup.year = parseInt(yearSelect.value);
        setupData.set('dateSetup', dateSetup);
        loadFilterAndSearch();
        debouncedSave();
    });

    const editDateSetup = dateSetupPanel.querySelector('.editBtn');
    editDateSetup.addEventListener('click', () => {
        openEditMenu(dateSetup.years, (newList) => {
            dateSetup.years = newList;
            setupData.set('dateSetup', dateSetup);
            debouncedSave();

            // Cập nhật lại yearSelect
            yearSelect.innerHTML = '';
            dateSetup.years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            yearSelect.value = dateSetup.year;
        });
    });

    checkedSetup.checked = setupData.get('filterChecked');
    let isChecked = checkedSetup.checked;
    checkedSetup.addEventListener('change', () => {
        if (checkedSetup.checked !== isChecked) {
            isChecked = checkedSetup.checked;
        }
        loadFilterAndSearch();
    });

    if (!setupData.check('stylesSetup')) { setupData.set('stylesSetup', []); }
    let stylesSetupData = setupData.get('stylesSetup');
    let index = 0;
    stylesSetupContent.innerHTML = '';
    stylesSetupData.forEach(style => { addSetupItem(stylesSetupContent, style, 'style', (checkbox) => {
        style.checked = checkbox.checked;
        setupData.set('stylesSetup', stylesSetupData);
        debouncedSave();
    }, index++) });

    const editStylesSetup = stylesSetup.querySelector('.editBtn');
    editStylesSetup.addEventListener('click', () => {
        const stylesSetupDataList = stylesSetupData.map(item => item.value);
        openEditMenu(stylesSetupDataList, (newList) => {
            stylesSetupData = newList.map(item => { 
                return { value: item, checked: false };
            });
            setupData.set('stylesSetup', stylesSetupData);
            debouncedSave();
            stylesSetupContent.innerHTML = '';
            let index = 0;
            stylesSetupData.forEach(style => { addSetupItem(stylesSetupContent, style, 'style', (checkbox) => {
                style.checked = checkbox.checked;
                setupData.set('stylesSetup', stylesSetupData);
                debouncedSave();
            }, index++)});
        });
    });

    stylesSetupAll.addEventListener('change', () => {
        stylesSetupData.forEach(style => {
            style.checked = stylesSetupAll.checked;
            const checkbox = stylesSetupContent.querySelector(`input[value="${style.value}"]`);
            if (checkbox) checkbox.checked = stylesSetupAll.checked;
        });
        setupData.set('stylesSetup', stylesSetupData);
        loadFilterAndSearch();
        debouncedSave();
    });

    if (!setupData.check('fashionsSetup')) { setupData.set('fashionsSetup', []); }
    let fashionsSetupData = setupData.get('fashionsSetup');
    index = 0;
    fashionsSetupContent.innerHTML = '';
    fashionsSetupData.forEach(fashion => { addSetupItem(fashionsSetupContent, fashion, 'fashion', (checkbox) => {
        fashion.checked = checkbox.checked;
        setupData.set('fashionsSetup', fashionsSetupData);
        debouncedSave();
    }, index++) });

    const editFashionsSetup = fashionsSetup.querySelector('.editBtn');
    editFashionsSetup.addEventListener('click', () => {
        const fashionsSetupDataList = fashionsSetupData.map(item => item.value);
        openEditMenu(fashionsSetupDataList, (newList) => {
            fashionsSetupData = newList.map(item => { 
                return { value: item, checked: false };
            });
            setupData.set('fashionsSetup', fashionsSetupData);
            debouncedSave();
            fashionsSetupContent.innerHTML = '';
            let index = 0;
            fashionsSetupData.forEach(fashion => { addSetupItem(fashionsSetupContent, fashion, 'fashion', (checkbox) => {
                fashion.checked = checkbox.checked;
                setupData.set('fashionsSetup', fashionsSetupData);
                debouncedSave();
            }, index++)});
        });
    });

    fashionsSetupAll.addEventListener('change', () => {
        fashionsSetupData.forEach(fashion => {
            fashion.checked = fashionsSetupAll.checked;
            const checkbox = fashionsSetupContent.querySelector(`input[value="${fashion.value}"]`);
            if (checkbox) checkbox.checked = fashionsSetupAll.checked;
        });
        setupData.set('fashionsSetup', fashionsSetupData);
        loadFilterAndSearch();
        debouncedSave();
    });
    loadSetup = true;
}

setupData.init().then(updateSetupData);
// setupData.addChangeSheetCallback('Setup', updateSetupData);

const sheetData = new LoadDataForDict(scriptURL, "Sheet1");
const debouncedSaveSheet = debounce(() => sheetData.save(), 1000);

function updateSheetData() {
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
    tempItems.forEach((obj, index) => {
        addMainItem(obj.id, obj.itemData);
    });

    closeLoadingBar();
    loadSheet = true;
}

sheetData.init().then(updateSheetData);
sheetData.addChangeSheetCallback('SheetData', updateSheetData);

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
    const alt = selected.querySelector('p').textContent;
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
        if (imgAddCmt) {
            // Thêm cơ bản
        } else {
            const img = selected.querySelector('img').src;
            addSpImageBox.src = img;
        }
    }
    imageBar.style.display = 'none';
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

function resetCmtPanelViewIsOpen(comment, content, img, cmtbtn, later) {
    if (isVertical) {
        if (isCmtOpen) {
            comment.style.display = 'flex';
            content.style.display = 'none';
            img.style.maxWidth = '50%';
        } else {
            comment.style.display = 'none';
            content.style.display = 'flex';
            img.style.maxWidth = '50%';
        }
        cmtbtn.style.display = 'flex';
        later.style.display = 'flex';
    } else {
        comment.style.display = 'flex';
        content.style.display = 'flex';
        img.style.maxWidth = '30%';
        cmtbtn.style.display = 'none';
        later.style.display = 'none';
    }
}

function addMainItem(id, item, isEdit = false) {
    let div

    if (!isEdit) {
        div = document.createElement('div');
        div.classList.add('main-item');
        div.setAttribute('spid', id);
        mainPanel.prepend(div);
    } else {
        div = mainPanel.querySelector(`[spid="${openSpMenuStyle}"]`);
        div.setAttribute('spid', id);
        div.innerHTML = '';
    }

    const img = document.createElement('img');
    img.src = item.img;
    img.loading = "lazy"; 
    img.classList.add('main-item-img');
    div.appendChild(img);

    const content = document.createElement('div');
    content.classList.add('main-item-content');
    div.appendChild(content);

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
    div.appendChild(comment);

    const later = document.createElement('div');
    later.classList.add('main-item-later');
    later.textContent = "›";
    comment.appendChild(later);

    const repBar = document.createElement('div');
    repBar.classList.add('main-item-rep-bar');
    comment.appendChild(repBar);

    const inputImgBtn = document.createElement('div');
    inputImgBtn.classList.add('main-item-input-img');
    inputImgBtn.onclick = () => { 
        imageBar.style.display = 'flex';
        const selected = document.querySelector('.image-item-bar.selected');
        if (selected) { selected.classList.remove('selected'); }
        imgAddCmt = true;
    };
    repBar.appendChild(inputImgBtn);

    const repInput = document.createElement('div');
    repInput.classList.add('main-item-rep-input');
    repInput.contentEditable = 'true';
    repInput.spellcheck = false;
    repBar.appendChild(repInput);

    const repBtn = document.createElement('div');
    repBtn.classList.add('main-item-rep-btn');
    repBar.appendChild(repBtn);

    repInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            repBtn.click();
        }
    });

    later.addEventListener('click', () => {
        isCmtOpen = !isCmtOpen;
        resetCmtPanelViewIsOpen(comment, content, img, cmtBtn, later);
    })

    cmtBtn.addEventListener('click', () => {
        isCmtOpen = !isCmtOpen;
        resetCmtPanelViewIsOpen(comment, content, img, cmtBtn, later);
    });

    deleteBtn.addEventListener('click', async () => {
        mainPanel.removeChild(div);
        sheetData.remove(id);
        sheetData.save();
        if (img.src && img.src !== 'icon/image.png') {
            const oldFileIdMatch = img.src.match(/[-\w]{25,}/);
            
            if (oldFileIdMatch) {
                console.log("Đang xóa ảnh cũ trên Drive:", oldFileIdMatch[0]);
                await deleteImageFromDrive(oldFileIdMatch[0]);
            }
        }
    });

    editBtn.addEventListener('click', () => {
        openSpMenuStyle = id;
        OpenAddSpMenu(setupData, item);
    });

    resetCmtPanelViewIsOpen(comment, content, img, cmtBtn, later);
}

function OpenAddSpMenu(setupData, setup) {
    addSpMenu.style.display = 'flex';
    const stylesSetup = setupData.get('stylesSetup');
    const fashionsSetup = setupData.get('fashionsSetup');
    addSpActorInput.innerHTML = '';
    addSpGroupInput.innerHTML = '';

    stylesSetup.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.value;
        addSpGroupInput.appendChild(option);
    });

    fashionsSetup.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.value;
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
        addSpActorInput.value = fashionsSetup[0].value;
        addSpGroupInput.value = stylesSetup[0].value;
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

    if (openPanel === 'cmd') {
        cmdPanel.style.left = 'calc(var(--panel-size) * 0.007)';
        cmdBtnItem.style.backgroundColor = '#6bfff3';
    } else {
        cmdPanel.style.left = '-100%';
        cmdBtnItem.style.backgroundColor = '#6bfff300';
    }
}

function resizeEvent() {
    if (window.innerWidth > window.innerHeight) { isVertical = false; } else { isVertical = true; }

    if (isVertical) {
        const panelSize = window.innerWidth;
        document.documentElement.style.setProperty('--panel-size', `${panelSize}px`);
        document.documentElement.style.setProperty('--sp-menu-size', '100%');
    } else {
        const panelSize = window.innerWidth * 0.35;
        document.documentElement.style.setProperty('--panel-size', `${panelSize}px`);
        document.documentElement.style.setProperty('--sp-menu-size', 'calc(var(--panel-size) * 1.2)');
    }

    mainPanel.querySelectorAll('.main-item').forEach(item => {
        const comment = item.querySelector('.main-item-comment');
        const content = item.querySelector('.main-item-content');
        const img = item.querySelector('.main-item-img');
        const cmtbtn = item.querySelector('.main-item-cmt-btn');
        const later = item.querySelector('.main-item-later');
        resetCmtPanelViewIsOpen(comment, content, img, cmtbtn, later);
    });
}

function addSetupItem(EL, dict, key, func, index) {
    const div = document.createElement('div');
    div.classList.add(`checked-${key}s-setup`);
    EL.appendChild(div);
    // id: checkbox-styleEA0099 ...
    const newID = `checkbox-${key}${index}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = dict.value;
    checkbox.id = newID;
    checkbox.checked = dict.checked;
    div.appendChild(checkbox);

    const label = document.createElement('label');
    label.textContent = dict.value;
    label.setAttribute('for', newID);
    div.appendChild(label);

    checkbox.addEventListener('change', () => { 
        func(checkbox);
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

addSpImgBox.addEventListener('click', () => {
    imageBar.style.display = 'flex';
    const selected = document.querySelector('.image-item-bar.selected');
    if (selected) { selected.classList.remove('selected'); }
    imgAddCmt = false;
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

cmdBtnItem.addEventListener('click', () => {
    if (openPanel !== 'cmd') { openPanel = 'cmd'; } else { openPanel = null; }
    openPanelEvent()
});

addBtnItem.addEventListener('click', () => {
    openSpMenuStyle = "add new";
    OpenAddSpMenu(setupData);
});

addSpMenuCloseBtn.addEventListener('click', async () => {
    addSpMenu.style.display = 'none';
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

        addSpMenu.style.display = 'none';
        addMainItem(id, newItems, true);
        sheetData.remove(openSpMenuStyle);
        sheetData.set(id, newItems);
        debouncedSaveSheet();
    }
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
