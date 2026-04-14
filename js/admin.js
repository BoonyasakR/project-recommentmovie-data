document.addEventListener('DOMContentLoaded', () => {
    const currentUser = MovieRecUI.requireAdmin();
    if (!currentUser) return;

    const identity = document.getElementById('adminIdentity');
    if (identity) {
        identity.textContent = `${currentUser.name} (${currentUser.role || 'admin'})`;
    }

    document.getElementById('refreshAdminSummaryBtn')?.addEventListener('click', loadAdminSummary);
    loadAdminSummary();
});

async function loadAdminSummary() {
    try {
        const [stats, users] = await Promise.all([
            getStats(),
            getUsers()
        ]);

        const adminUsers = (Array.isArray(users) ? users : []).filter((user) => user.role === 'admin').length;

        document.getElementById('adminTotalUsers').textContent = stats?.users ?? users.length ?? 0;
        document.getElementById('adminTotalAdmins').textContent = adminUsers;
        document.getElementById('adminTotalMovies').textContent = stats?.movies ?? 0;
        document.getElementById('adminTotalRelationships').textContent = stats?.relationships ?? 0;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

window.loadAdminSummary = loadAdminSummary;

async function loadAdminUserProfile(name) {
    const targetName = String(name || '').trim();
    const badge = document.getElementById('adminUserProfileBadge');
    const container = document.getElementById('adminUserProfile');

    if (!targetName || !container) return;

    if (badge) badge.textContent = 'Loading...';
    container.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><span>Loading user profile...</span></div>';

    try {
        const profile = await getUserProfile(targetName);
        const watched = (profile.watched || []).filter(Boolean);
        const liked = (profile.liked || []).filter(Boolean);

        if (badge) {
            badge.textContent = `${profile.name} • WATCHED ${watched.length} • LIKED ${liked.length}`;
        }

        container.innerHTML = `
            <h3 style="margin:0 0 0.85rem;">${MovieRecUI.esc(profile.name)} ${profile.age ? `<span style="color:var(--text-muted); font-weight:400;">(${profile.age} yrs)</span>` : ''}</h3>
            <div style="display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap;">
                <div class="mini-stat">
                    <div class="mini-stat-number">${watched.length}</div>
                    <div class="mini-stat-label">WATCHED</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-number">${liked.length}</div>
                    <div class="mini-stat-label">LIKED</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-number">${profile.role === 'admin' ? 'A' : 'U'}</div>
                    <div class="mini-stat-label">${profile.role === 'admin' ? 'ADMIN' : 'USER'}</div>
                </div>
            </div>
            ${watched.length ? `<div style="margin-bottom:1rem;"><strong style="font-size:0.9rem;">Watched</strong><div class="tag-list">${watched.map((movie) => `<span class="badge badge-primary">${MovieRecUI.esc(movie)}</span>`).join('')}</div></div>` : ''}
            ${liked.length ? `<div style="margin-bottom:1rem;"><strong style="font-size:0.9rem;">Liked</strong><div class="tag-list">${liked.map((movie) => `<span class="badge badge-success">${MovieRecUI.esc(movie)}</span>`).join('')}</div></div>` : ''}
            ${!watched.length && !liked.length ? '<div class="section-note">User นี้ยังไม่มี activity ในระบบ</div>' : ''}
        `;
    } catch (error) {
        if (badge) badge.textContent = 'Load failed';
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">X</div>
                <h3>Unable to load selected user</h3>
                <p>${MovieRecUI.esc(error.message)}</p>
            </div>
        `;
        showToast(error.message, 'error');
    }
}

window.loadAdminUserProfile = loadAdminUserProfile;
