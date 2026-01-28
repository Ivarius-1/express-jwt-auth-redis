class AuthApp {
    constructor() {
        this.baseUrl = 'http://localhost:3000/app'; 
        this.currentView = 'auth'; 
        this.init();
    }

    init() {
        this.renderAuthView();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // ==========================
    // Новый метод для защищённых запросов с авто-refresh
    // ==========================
    async fetchWithAuth(url, options = {}) {
        let response = await fetch(url, {
            ...options,
            credentials: 'include'
        });

        // accessToken истёк
        if (response.status === 401 || response.status === 403) {
            const refreshResponse = await fetch(`${this.baseUrl}/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!refreshResponse.ok) {
                localStorage.removeItem('user');
                this.showAuth();
                throw new Error('Сессия истекла');
            }

            // accessToken обновился → повторяем запрос
            response = await fetch(url, {
                ...options,
                credentials: 'include'
            });
        }

        return response;
    }

    async checkAuthStatus() {
        const user = localStorage.getItem('user');
        
        if (!user) return;

        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/posts`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const userData = JSON.parse(user);
                this.showProfile(userData);
                this.loadUserPosts();
            } else {
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            localStorage.removeItem('user');
            this.showAuth();
        }
    }

    renderAuthView() {
        const authContainer = document.getElementById('auth-container');
        authContainer.innerHTML = `
            <div class="tabs">
                <button class="tab-button active" data-tab="login">Вход</button>
                <button class="tab-button" data-tab="register">Регистрация</button>
            </div>
            
            <div id="login-form" class="form-tab active">
                <div class="form-container">
                    <div class="form-group">
                        <label for="login-username">Логин:</label>
                        <input type="text" id="login-username" placeholder="Введите логин">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Пароль:</label>
                        <input type="password" id="login-password" placeholder="Введите пароль">
                    </div>
                    <button id="login-btn">Войти</button>
                    <div id="login-error" class="error-message"></div>
                    <div id="login-success" class="success-message"></div>
                </div>
            </div>
            
            <div id="register-form" class="form-tab">
                <div class="form-container">
                    <div class="form-group">
                        <label for="register-username">Логин:</label>
                        <input type="text" id="register-username" placeholder="Придумайте логин">
                    </div>
                    <div class="form-group">
                        <label for="register-password">Пароль:</label>
                        <input type="password" id="register-password" placeholder="Придумайте пароль">
                    </div>
                    <button id="register-btn">Зарегистрироваться</button>
                    <div id="register-error" class="error-message"></div>
                    <div id="register-success" class="success-message"></div>
                </div>
            </div>
        `;
    }

    renderProfileView(user) {
        const profileContainer = document.getElementById('profile-container');
        profileContainer.innerHTML = `
            <div class="profile-info">
                <h2>Добро пожаловать, ${user.login}!</h2>
                <p><strong>Логин:</strong> ${user.login}</p>
                <p><strong>Статус:</strong> <span style="color: green;">● Онлайн</span></p>
            </div>
            
            <div id="posts-section">
                <h2>Мои посты</h2>
                <div id="posts-container">
                    <div class="loading">Загрузка постов...</div>
                </div>
                
                <div class="create-post-form">
                    <h3>Создать новый пост</h3>
                    <div class="form-group">
                        <input type="text" id="post-title" placeholder="Заголовок поста">
                    </div>
                    <div class="form-group">
                        <textarea id="post-description" placeholder="Описание поста" rows="4"></textarea>
                    </div>
                    <button id="create-post-btn">Создать пост</button>
                    <div id="post-error" class="error-message"></div>
                    <div id="post-success" class="success-message"></div>
                </div>
            </div>
            
            <button id="logout-btn" style="margin-top: 30px;">Выйти</button>
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                this.switchTab(e.target.dataset.tab);
            }
            
            if (e.target.id === 'register-btn') this.register();
            if (e.target.id === 'login-btn') this.login();
            if (e.target.id === 'logout-btn') this.logout();
            if (e.target.id === 'create-post-btn') this.createPost();
            
            if (e.target.classList.contains('delete-post-btn')) {
                this.deletePost(e.target.dataset.postId);
            }
            
            if (e.target.classList.contains('edit-post-btn')) {
                this.editPost(e.target.dataset.postId);
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.form-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.tab-button[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`${tabName}-form`)?.classList.add('active');
    }

    async register() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (!username || !password) {
            errorDiv.textContent = 'Пожалуйста, заполните все поля';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/regUser`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: username, password })
            });

            const data = await response.json();

            if (data.status) {
                successDiv.textContent = data.message;
                successDiv.style.display = 'block';
                
                document.getElementById('register-username').value = '';
                document.getElementById('register-password').value = '';
                
                setTimeout(() => {
                    this.switchTab('login');
                    document.getElementById('login-username').value = username;
                    successDiv.style.display = 'none';
                }, 2000);
            } else {
                errorDiv.textContent = data.message || 'Ошибка регистрации';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            errorDiv.textContent = 'Ошибка соединения с сервером';
            errorDiv.style.display = 'block';
        }
    }
    
    async login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const successDiv = document.getElementById('login-success');

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (!username || !password) {
            errorDiv.textContent = 'Пожалуйста, заполните все поля';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/authUser`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: username, password })
            });

            const data = await response.json();

            if (data.status) {
                localStorage.setItem('user', JSON.stringify(data.user));
                successDiv.textContent = data.message || 'Успешный вход!';
                successDiv.style.display = 'block';
                
                setTimeout(() => {
                    this.showProfile(data.user);
                    this.loadUserPosts();
                }, 1000);
            } else {
                errorDiv.textContent = data.message || 'Неверный логин или пароль';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            errorDiv.textContent = 'Ошибка соединения с сервером';
            errorDiv.style.display = 'block';
        }
    }

    async loadUserPosts() {
        const postsContainer = document.getElementById('posts-container');
        
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/posts`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderPosts(data);
            } else {
                postsContainer.innerHTML = '<div class="error-message">Ошибка загрузки постов</div>';
            }
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            postsContainer.innerHTML = '<div class="error-message">Сессия истекла</div>';
        }
    }

    renderPosts(postsData) {
        const postsContainer = document.getElementById('posts-container');
        
        if (!postsData || postsData.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">У вас пока нет постов. Создайте первый!</div>';
            return;
        }
        
        let postsHtml = '';
        
        if (Array.isArray(postsData)) {
            postsData.forEach(post => {
                postsHtml += this.createPostHtml(post);
            });
        } 
        else if (postsData.data && Array.isArray(postsData.data)) {
            postsData.data.forEach(post => {
                postsHtml += this.createPostHtml(post);
            });
        } 
        else if (postsData.posts && Array.isArray(postsData.posts)) {
            postsData.posts.forEach(post => {
                postsHtml += this.createPostHtml(post);
            });
        }
        
        postsContainer.innerHTML = postsHtml;
    }

    createPostHtml(post) {
        const createdAt = post.createdAt 
            ? new Date(post.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Дата не указана';
        
        return `
            <div class="post" id="post-${post.id}">
                <h3>${post.title || 'Без названия'}</h3>
                <p>${post.description || 'Нет описания'}</p>
                <div class="post-meta">
                    <span>Создан: ${createdAt}</span>
                    <div class="post-actions">
                        <button class="edit-post-btn" data-post-id="${post.id}">Редактировать</button>
                        <button class="delete-post-btn" data-post-id="${post.id}">Удалить</button>
                    </div>
                </div>
            </div>
        `;
    }

    async createPost() {
        const title = document.getElementById('post-title').value;
        const description = document.getElementById('post-description').value;
        const errorDiv = document.getElementById('post-error');
        const successDiv = document.getElementById('post-success');

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (!title.trim()) {
            errorDiv.textContent = 'Заголовок обязателен';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description
                })
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.textContent = 'Пост успешно создан!';
                successDiv.style.display = 'block';
                
                document.getElementById('post-title').value = '';
                document.getElementById('post-description').value = '';
                
                setTimeout(() => {
                    this.loadUserPosts();
                    successDiv.style.display = 'none';
                }, 2000);
            } else {
                errorDiv.textContent = data.message || 'Ошибка создания поста';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка создания поста:', error);
            errorDiv.textContent = 'Ошибка соединения с сервером';
            errorDiv.style.display = 'block';
        }
    }

    async deletePost(postId) {
        if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) {
                    postElement.remove();
                }
                
                const successDiv = document.getElementById('post-success');
                successDiv.textContent = 'Пост успешно удален';
                successDiv.style.display = 'block';
                
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 2000);
                
                const postsContainer = document.getElementById('posts-container');
                if (postsContainer.children.length === 0) {
                    this.loadUserPosts();
                }
            }
        } catch (error) {
            console.error('Ошибка удаления поста:', error);
            alert('Ошибка при удалении поста');
        }
    }

    async editPost(postId) {
        const postElement = document.getElementById(`post-${postId}`);
        const title = prompt('Введите новый заголовок:', 
            postElement.querySelector('h3').textContent);
        
        if (title === null) return; 
        
        const description = prompt('Введите новое описание:',
            postElement.querySelector('p').textContent);
        
        if (description === null) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description
                })
            });
            
            if (response.ok) {
                postElement.querySelector('h3').textContent = title;
                postElement.querySelector('p').textContent = description;
                
                const successDiv = document.getElementById('post-success');
                successDiv.textContent = 'Пост успешно обновлен';
                successDiv.style.display = 'block';
                
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            console.error('Ошибка редактирования поста:', error);
            alert('Ошибка при редактировании поста');
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.baseUrl}/logoutUser`, {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.status) {
                localStorage.removeItem('user');
                this.showAuth();
            } else {
                console.error('Ошибка при выходе:', data.message);
                localStorage.removeItem('user');
                this.showAuth();
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
            localStorage.removeItem('user');
            this.showAuth();
        }
    }

    showProfile(user) {
        this.renderProfileView(user);
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('profile-container').classList.remove('hidden');
    }

    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('profile-container').classList.add('hidden');
        this.switchTab('login');
        
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthApp();
});