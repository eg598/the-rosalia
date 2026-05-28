/* ═══════════════════════════════════════════════
   THE ROSALIA BCN — Admin Panel JS
   admin/admin.js
   ═══════════════════════════════════════════════ */

'use strict';

(async () => {

  const isLogin     = document.body.classList.contains('admin-login-body');
  const isDashboard = document.body.classList.contains('admin-body');

  if (isLogin)     initLogin();
  if (isDashboard) await initDashboard();

  /* ════════════════════════════════════════════
     LOGIN PAGE
  ════════════════════════════════════════════ */
  function initLogin() {
    const form    = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const btn     = document.getElementById('login-btn');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showError('Por favor completa todos los campos.');
        return;
      }

      btn.disabled    = true;
      btn.textContent = 'Accediendo…';
      hideError();

      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          window.location.href = '/admin/dashboard';
        } else {
          const data = await res.json().catch(() => ({}));
          showError(data.error || 'Credenciales incorrectas.');
        }
      } catch {
        showError('Error de conexión. Comprueba que el servidor está activo.');
      } finally {
        btn.disabled    = false;
        btn.textContent = 'Acceder';
      }
    });

    function showError(msg) {
      errorEl.textContent  = msg;
      errorEl.style.display = 'block';
    }
    function hideError() { errorEl.style.display = 'none'; }
  }

  /* ════════════════════════════════════════════
     DASHBOARD PAGE
  ════════════════════════════════════════════ */
  async function initDashboard() {

    // ── Auth guard ──────────────────────────────
    let currentUser;
    try {
      const res = await apiFetch('/api/auth/me');
      if (!res.ok) { redirect('/admin'); return; }
      currentUser = await res.json();
      const emailEl = document.getElementById('admin-user-email');
      if (emailEl) emailEl.textContent = currentUser.email;
    } catch {
      redirect('/admin');
      return;
    }

    // ── State ────────────────────────────────────
    let posts     = [];
    let menuItems = [];
    let editingPost = null;
    let editingItem = null;
    let currentView = 'dashboard';

    const CATEGORIES = {
      brunch:       'Brunch & Desayunos',
      lunch_dinner: 'Almuerzo & Cenas',
      street_food:  'Street Food Fusion',
      drinks:       'Dulces & Bebidas',
    };

    // ── Mobile sidebar ───────────────────────────
    const sidebar    = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          e.target !== menuToggle) {
        sidebar.classList.remove('open');
      }
    });

    // ── Sidebar navigation ───────────────────────
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    function switchView(view) {
      currentView = view;
      document.querySelectorAll('.admin-nav-item[data-view]').forEach(b =>
        b.classList.toggle('active', b.dataset.view === view)
      );
      document.querySelectorAll('.admin-view').forEach(v =>
        v.style.display = (v.id === `view-${view}`) ? '' : 'none'
      );
      if (view === 'dashboard') loadStats();
      if (view === 'blog')      loadPosts();
      if (view === 'menu')      loadMenuItems();
      if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
    }

    // ── Logout ───────────────────────────────────
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      redirect('/admin');
    });

    // ── Stats ────────────────────────────────────
    async function loadStats() {
      try {
        const res  = await apiFetch('/api/admin/stats');
        const data = await res.json();
        setText('stat-posts',     data.totalPosts);
        setText('stat-published', data.publishedPosts);
        setText('stat-menu',      data.totalMenuItems);
        setText('stat-active',    data.activeMenuItems);
      } catch { /* silent */ }
    }

    /* ──────────────────────────────────────────────
       BLOG POSTS
    ────────────────────────────────────────────── */
    async function loadPosts() {
      try {
        const res = await apiFetch('/api/admin/posts');
        posts = await res.json();
        renderPosts();
      } catch { toast('Error al cargar los posts.', 'error'); }
    }

    function renderPosts() {
      const tbody = document.getElementById('posts-tbody');
      if (!posts.length) {
        tbody.innerHTML = emptyRow(4, '📝', 'No hay posts aún. Crea el primero.');
        return;
      }
      tbody.innerHTML = posts.map(p => `
        <tr>
          <td>
            <strong>${esc(p.title_es)}</strong>
            ${p.title_en ? `<span class="admin-cell-sub">${esc(p.title_en)}</span>` : ''}
          </td>
          <td>
            <span class="admin-badge ${p.published ? 'admin-badge--published' : 'admin-badge--draft'}">
              ${p.published ? 'Publicado' : 'Borrador'}
            </span>
          </td>
          <td style="color:var(--a-subtext)">${fmtDate(p.created_at)}</td>
          <td>
            <div class="admin-actions">
              <button class="admin-btn admin-btn--ghost admin-btn--sm"
                      onclick="window._editPost(${p.id})">Editar</button>
              <button class="admin-btn admin-btn--danger admin-btn--sm"
                      onclick="window._deletePost(${p.id})">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('btn-add-post')?.addEventListener('click', () => openPostModal(null));

    window._editPost = id => {
      const p = posts.find(x => x.id === id);
      if (p) openPostModal(p);
    };

    window._deletePost = async id => {
      if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return;
      const res = await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        posts = posts.filter(x => x.id !== id);
        renderPosts();
        toast('Post eliminado.', 'success');
        if (currentView === 'dashboard') loadStats();
      } else {
        toast('No se pudo eliminar el post.', 'error');
      }
    };

    function openPostModal(post) {
      editingPost = post;
      const isEdit = !!post;
      setModalTitle(isEdit ? 'Editar post' : 'Nuevo post');

      setModalBody(`
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-title-es">Título (ES) *</label>
          <input type="text" id="f-title-es" class="admin-form-input"
                 value="${esc(post?.title_es || '')}" placeholder="Título en español" />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-title-en">Título (EN)</label>
          <input type="text" id="f-title-en" class="admin-form-input"
                 value="${esc(post?.title_en || '')}" placeholder="Title in English" />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-excerpt-es">Extracto (ES)</label>
          <textarea id="f-excerpt-es" class="admin-form-textarea"
                    placeholder="Breve resumen del post…">${esc(post?.excerpt_es || '')}</textarea>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-content-es">Contenido (ES) *</label>
          <textarea id="f-content-es" class="admin-form-textarea" style="min-height:130px"
                    placeholder="Contenido completo del post…">${esc(post?.content_es || '')}</textarea>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-content-en">Contenido (EN)</label>
          <textarea id="f-content-en" class="admin-form-textarea" style="min-height:130px"
                    placeholder="Full post content in English…">${esc(post?.content_en || '')}</textarea>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-image-url">URL de imagen</label>
          <input type="text" id="f-image-url" class="admin-form-input"
                 value="${esc(post?.image_url || '')}" placeholder="/uploads/imagen.jpg" />
        </div>
        <div class="admin-form-group">
          <label class="admin-check-row">
            <input type="checkbox" id="f-published" ${post?.published ? 'checked' : ''} />
            <span class="admin-form-label">Publicar este post</span>
          </label>
        </div>
      `);

      setModalFooter([
        { label: 'Cancelar', cls: 'admin-btn--ghost', onClick: closeModal },
        { label: isEdit ? 'Guardar cambios' : 'Crear post', cls: 'admin-btn--primary', onClick: savePost },
      ]);

      openModal();
    }

    async function savePost() {
      const payload = {
        title_es:   val('f-title-es'),
        title_en:   val('f-title-en'),
        excerpt_es: val('f-excerpt-es'),
        content_es: val('f-content-es'),
        content_en: val('f-content-en'),
        image_url:  val('f-image-url'),
        published:  checked('f-published'),
      };

      if (!payload.title_es)   { toast('El título (ES) es obligatorio.', 'error'); return; }
      if (!payload.content_es) { toast('El contenido (ES) es obligatorio.', 'error'); return; }

      const url    = editingPost ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        await loadPosts();
        closeModal();
        toast(editingPost ? 'Post actualizado.' : 'Post creado.', 'success');
        if (currentView === 'dashboard') loadStats();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Error al guardar.', 'error');
      }
    }

    /* ──────────────────────────────────────────────
       MENU ITEMS
    ────────────────────────────────────────────── */
    async function loadMenuItems() {
      try {
        const res = await apiFetch('/api/admin/menu-items');
        menuItems = await res.json();
        renderMenuItems();
      } catch { toast('Error al cargar el menú.', 'error'); }
    }

    function renderMenuItems() {
      const tbody = document.getElementById('menu-tbody');
      if (!menuItems.length) {
        tbody.innerHTML = emptyRow(5, '🍽️', 'No hay items en el menú. Añade el primero.');
        return;
      }
      tbody.innerHTML = menuItems.map(item => `
        <tr>
          <td>
            <strong>${esc(item.name_es)}</strong>
            ${item.description_es
              ? `<span class="admin-cell-sub">${esc(item.description_es.slice(0, 55))}${item.description_es.length > 55 ? '…' : ''}</span>`
              : ''}
          </td>
          <td style="color:var(--a-subtext)">${CATEGORIES[item.category] || item.category}</td>
          <td><span class="admin-price">€${Number(item.price).toFixed(2)}</span></td>
          <td>
            <span class="admin-badge ${item.active ? 'admin-badge--active' : 'admin-badge--inactive'}">
              ${item.active ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div class="admin-actions">
              <button class="admin-btn admin-btn--ghost admin-btn--sm"
                      onclick="window._editItem(${item.id})">Editar</button>
              <button class="admin-btn admin-btn--danger admin-btn--sm"
                      onclick="window._deleteItem(${item.id})">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('btn-add-item')?.addEventListener('click', () => openMenuModal(null));

    window._editItem = id => {
      const item = menuItems.find(x => x.id === id);
      if (item) openMenuModal(item);
    };

    window._deleteItem = async id => {
      if (!confirm('¿Eliminar este item del menú?')) return;
      const res = await apiFetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        menuItems = menuItems.filter(x => x.id !== id);
        renderMenuItems();
        toast('Item eliminado.', 'success');
        if (currentView === 'dashboard') loadStats();
      } else {
        toast('No se pudo eliminar el item.', 'error');
      }
    };

    function openMenuModal(item) {
      editingItem = item;
      const isEdit = !!item;
      setModalTitle(isEdit ? 'Editar item de menú' : 'Nuevo item de menú');

      const catOptions = Object.entries(CATEGORIES).map(([val, label]) =>
        `<option value="${val}" ${item?.category === val ? 'selected' : ''}>${label}</option>`
      ).join('');

      setModalBody(`
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-form-label" for="f-name-es">Nombre (ES) *</label>
            <input type="text" id="f-name-es" class="admin-form-input"
                   value="${esc(item?.name_es || '')}" placeholder="Nombre en español" />
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label" for="f-name-en">Nombre (EN)</label>
            <input type="text" id="f-name-en" class="admin-form-input"
                   value="${esc(item?.name_en || '')}" placeholder="Name in English" />
          </div>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-desc-es">Descripción (ES)</label>
          <textarea id="f-desc-es" class="admin-form-textarea"
                    placeholder="Descripción del plato…">${esc(item?.description_es || '')}</textarea>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-desc-en">Descripción (EN)</label>
          <textarea id="f-desc-en" class="admin-form-textarea"
                    placeholder="Dish description…">${esc(item?.description_en || '')}</textarea>
        </div>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label class="admin-form-label" for="f-price">Precio (€) *</label>
            <input type="number" id="f-price" class="admin-form-input"
                   value="${item?.price ?? ''}" step="0.01" min="0" placeholder="14.95" />
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label" for="f-category">Categoría *</label>
            <select id="f-category" class="admin-form-select">
              ${catOptions}
            </select>
          </div>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label" for="f-item-image">URL de imagen</label>
          <input type="text" id="f-item-image" class="admin-form-input"
                 value="${esc(item?.image_url || '')}" placeholder="/uploads/plato.jpg" />
        </div>
        <div class="admin-form-group">
          <label class="admin-check-row">
            <input type="checkbox" id="f-active" ${item?.active !== 0 ? 'checked' : ''} />
            <span class="admin-form-label">Activo (visible en el menú)</span>
          </label>
        </div>
      `);

      setModalFooter([
        { label: 'Cancelar', cls: 'admin-btn--ghost', onClick: closeModal },
        { label: isEdit ? 'Guardar cambios' : 'Crear item', cls: 'admin-btn--primary', onClick: saveMenuItem },
      ]);

      openModal();
    }

    async function saveMenuItem() {
      const price = parseFloat(document.getElementById('f-price').value);
      const payload = {
        name_es:        val('f-name-es'),
        name_en:        val('f-name-en'),
        description_es: val('f-desc-es'),
        description_en: val('f-desc-en'),
        price,
        category:       document.getElementById('f-category').value,
        image_url:      val('f-item-image'),
        active:         checked('f-active'),
      };

      if (!payload.name_es)                  { toast('El nombre (ES) es obligatorio.', 'error'); return; }
      if (isNaN(payload.price) || price < 0) { toast('El precio debe ser un número válido.', 'error'); return; }

      const url    = editingItem ? `/api/admin/menu-items/${editingItem.id}` : '/api/admin/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        await loadMenuItems();
        closeModal();
        toast(editingItem ? 'Item actualizado.' : 'Item creado.', 'success');
        if (currentView === 'dashboard') loadStats();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Error al guardar.', 'error');
      }
    }

    /* ──────────────────────────────────────────────
       MODAL HELPERS
    ────────────────────────────────────────────── */
    function openModal() {
      document.getElementById('modal-overlay').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      document.getElementById('modal-overlay').style.display = 'none';
      document.body.style.overflow = '';
      editingPost = null;
      editingItem = null;
    }
    function setModalTitle(t)  { document.getElementById('modal-title').textContent = t; }
    function setModalBody(html) { document.getElementById('modal-body').innerHTML = html; }
    function setModalFooter(buttons) {
      const footer = document.getElementById('modal-footer');
      footer.innerHTML = '';
      buttons.forEach(({ label, cls, onClick }) => {
        const btn = document.createElement('button');
        btn.className = `admin-btn ${cls}`;
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        footer.appendChild(btn);
      });
    }

    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('modal-overlay').style.display !== 'none') {
        closeModal();
      }
    });

    /* ──────────────────────────────────────────────
       TOAST
    ────────────────────────────────────────────── */
    let toastTimer;
    function toast(msg, type = 'success') {
      const el = document.getElementById('toast');
      el.textContent  = msg;
      el.className    = `admin-toast admin-toast--${type}`;
      el.style.display = 'block';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
    }

    // ── Initial load ─────────────────────────────
    loadStats();
  }

  /* ════════════════════════════════════════════
     SHARED UTILITIES
  ════════════════════════════════════════════ */

  function apiFetch(url, opts = {}) {
    return fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function val(id)     { return (document.getElementById(id)?.value ?? '').trim(); }
  function checked(id) { return !!document.getElementById(id)?.checked; }
  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function redirect(url)  { window.location.href = url; }
  function fmtDate(str)   {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function emptyRow(cols, icon, msg) {
    return `<tr><td colspan="${cols}">
      <div class="admin-empty">
        <div class="admin-empty-icon">${icon}</div>
        <p>${msg}</p>
      </div>
    </td></tr>`;
  }

})();
