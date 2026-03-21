const headerLogAvt = document.getElementById('login-acc-avt');
const logBox = document.getElementById('log-box');
const logBoxAvt = document.getElementById('log-box-avt');
const logSetBar = document.getElementsByClassName('log-set-bar');
const logBoxLogin = document.getElementById('log-box-login');
const logBoxRegister = document.getElementById('log-box-register');
const logBoxLogout = document.getElementById('log-box-logout');
const logBoxEdit = document.getElementById('log-box-edit');
const logBoxUsername = document.getElementById('log-box-username');
const loginUserMenu = document.getElementById('login-user-menu');
const registerUserMenu = document.getElementById('register-user-menu');
const editUserMenu = document.getElementById('edit-user-menu');
const loginUserMenuApply = document.getElementsByClassName('apply')[0];
const registerUserMenuApply = document.getElementsByClassName('apply')[1];
const editUserMenuApply = document.getElementsByClassName('apply')[2];

let hideTimeout;

const showBox = () => {
    clearTimeout(hideTimeout); 
    logBox.style.display = 'flex';
};

const hideBox = () => {
    hideTimeout = setTimeout(() => {
        logBox.style.display = 'none';
    }, 300);
};

headerLogAvt.addEventListener('mouseenter', showBox);
logBox.addEventListener('mouseenter', showBox);

headerLogAvt.addEventListener('mouseleave', hideBox);
logBox.addEventListener('mouseleave', hideBox);

loginUserMenu.querySelector('.close').addEventListener('click', () => {
    loginUserMenu.style.display = 'none';
    document.getElementById('app').inert = false;
})

registerUserMenu.querySelector('.close').addEventListener('click', () => {
    registerUserMenu.style.display = 'none';
    document.getElementById('app').inert = false;
})

editUserMenu.querySelector('.close').addEventListener('click', () => {
    editUserMenu.style.display = 'none';
    document.getElementById('app').inert = false;
})

export class LoginUser {
    constructor(userData, storage) {
        this.user = null;
        this.pass = null;
        this.loging = false;
        this.avt = "icon/user.png";
        this.id = null;
        this.userData = userData;
        this.storage = storage;
        logSetBar[0].style.display = 'flex';
        logSetBar[1].style.display = 'none';

        logBoxLogout.onclick = () => this.logout();
        logBoxLogin.onclick = () => this.openSetLoginMenu();
        logBoxRegister.onclick = () => this.openSetRegisterMenu();
        logBoxEdit.onclick = () => this.openEditUserMenu();
        editUserMenuApply.onclick = () => this.applyEditUser();
        loginUserMenuApply.onclick = () => {
            const user = loginUserMenu.querySelector('.user').value;
            const pass = loginUserMenu.querySelector('.pass').value;
            this.login(user, pass);
            if (this.loging) {
                this.setLogin()
            } else {
                loginUserMenu.querySelector('p').textContent = 'Tài khoản hoặc mật khẩu không chính xác!';
                return;
            }
            loginUserMenu.style.display = 'none';
            document.getElementById('app').inert = false;
        };
        registerUserMenuApply.onclick = () => {
            const user = registerUserMenu.querySelector('.user').value;
            const pass = registerUserMenu.querySelector('.pass').value;
            const repass = registerUserMenu.querySelector('.repass').value;
            this.register(user, pass, repass);
            if (this.loging) this.setLogin();
            registerUserMenu.style.display = 'none';
            document.getElementById('app').inert = false;
        };
    }

    login(user, pass) {
        if (!user || !pass) return;
        this.userData.forEach((key, value) => {
            if (value.username === user && value.password === pass) {
                this.user = user;
                this.pass = pass;
                this.loging = true;
                this.avt = value.avt;
                this.id = key;
            }
        })
        if (this.loging) this.setLogin();
    }

    logout() {
        this.user = null;
        this.pass = null;
        this.loging = false;
        this.avt = "icon/user.png";
        this.id = null;
        logSetBar[0].style.display = 'flex';
        logSetBar[1].style.display = 'none';
        this.storage.removeToken('userName');
        this.storage.removeToken('userPass');
        headerLogAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxUsername.textContent = 'User name';
    }

    register(user, pass, repass) {
        if (!user || !pass || !repass) return;
        if (pass !== repass) {
            registerUserMenu.querySelector('p').textContent = 'Mật khẩu không trùng khóp!';
            return
        };
        this.user = user;
        this.pass = pass;
        this.loging = true;
        this.avt = 'icon/user.png';
        this.id = `${this.user} - ${new Date().getTime()}`;
        const newData = {
            username: this.user,
            password: this.pass,
            avt: this.avt
        }
        this.userData.set(this.id, newData);
        this.userData.save();
        this.setLogin();
    }

    setLogin() {
        this.storage.setToken('userName', this.user);
        this.storage.setToken('userPass', this.pass);
        logSetBar[0].style.display = 'none';
        logSetBar[1].style.display = 'flex';
        headerLogAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxUsername.textContent = this.user;
    }

    openSetLoginMenu() {
        loginUserMenu.style.display = 'flex';
        document.getElementById('app').inert = true;
    }

    openSetRegisterMenu() {
        registerUserMenu.style.display = 'flex';
        document.getElementById('app').inert = true;
    }

    openEditUserMenu() {
        const avtEl = editUserMenu.querySelector('img');
        const userEl = editUserMenu.querySelector('.user');
        const passEl = editUserMenu.querySelector('.pass');
        const repassEl = editUserMenu.querySelector('.repass');
        avtEl.src = this.avt;
        userEl.value = this.user;
        passEl.value = this.pass;
        repassEl.value = this.pass;
        editUserMenu.style.display = 'flex';
        document.getElementById('app').inert = true;
    }

    applyEditUser() {
        const user = editUserMenu.querySelector('.user').value;
        const pass = editUserMenu.querySelector('.pass').value;
        const repass = editUserMenu.querySelector('.repass').value;
        if (pass !== repass) {
            editUserMenu.querySelector('p').textContent = 'Mật khẩu không trùng khớp!';
            return
        };
        this.user = user;
        this.pass = pass;
        this.avt = editUserMenu.querySelector('img').src;
        const newData = {
            username: this.user,
            password: this.pass,
            avt: this.avt
        }
        this.userData.set(this.id, newData);
        this.userData.save();
        this.storage.setToken('userName', this.user);
        this.storage.setToken('userPass', this.pass);
        headerLogAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxAvt.style.backgroundImage = `url("${this.avt}")`;
        logBoxUsername.textContent = this.user;
        editUserMenu.style.display = 'none';
        document.getElementById('app').inert = false;
    }
}