const RECOMMEND_GENRE_ICONS = {
    Action: '🔥',
    Comedy: '😂',
    Drama: '🎭',
    'Sci-Fi': '🚀',
    Horror: '👻',
    Romance: '💖',
    Thriller: '😱',
    Animation: '🎨'
};

const recommendState = {
    currentUser: MovieRecUI.requireAuth(),
    users: [],
    profile: null
};

document.addEventListener('DOMContentLoaded', () => {
    if (!recommendState.currentUser) return;

    document.querySelectorAll('[data-admin-link]').forEach((link) => {
        link.style.display = MovieRecUI.isAdmin(recommendState.currentUser) ? '' : 'none';
    });

    document.getElementById('recUser').addEventListener('change', handleUserChange);
    document.getElementById('recMethod').addEventListener('change', handleMethodChange);
    document.getElementById('recBtn').addEventListener('click', handleRecommend);
    document.getElementById('refreshRecommendBtn').addEventListener('click', loadRecommendPage);

    document.getElementById('recMethod').value = 'personalized';
    loadRecommendPage();
});

async function loadRecommendPage() {
    try {
        const users = await getUsers();
        recommendState.users = Array.isArray(users) ? users : [];
        setupUserSelector();
        await loadProfile();
        await handleRecommend();
        MovieRecUI.refreshConnectionStatus();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function setupUserSelector() {
    const select = document.getElementById('recUser');
    const group = document.getElementById('recUserGroup');
    const isAdmin = MovieRecUI.isAdmin(recommendState.currentUser);

    if (!isAdmin) {
        group.style.display = 'none';
        select.innerHTML = `<option value="${MovieRecUI.esc(recommendState.currentUser.name)}">${MovieRecUI.esc(recommendState.currentUser.name)}</option>`;
        select.value = recommendState.currentUser.name;
        return;
    }

    group.style.display = '';
    select.innerHTML = recommendState.users.map((user) =>
        `<option value="${MovieRecUI.esc(user.name)}">${MovieRecUI.esc(user.name)}</option>`
    ).join('');

    if (![...select.options].some((option) => option.value === select.value)) {
        select.value = recommendState.currentUser.name || (recommendState.users[0]?.name || '');
    }
}

async function handleUserChange() {
    await loadProfile();
    await handleRecommend();
}

async function handleMethodChange() {
    renderSummaryPanel();
    await handleRecommend();
}

async function loadProfile() {
    const name = document.getElementById('recUser').value;
    const card = document.getElementById('userProfileCard');
    const el = document.getElementById('userProfile');

    if (!name) {
        recommendState.profile = null;
        card.style.display = 'none';
        renderSummaryPanel();
        return;
    }

    const profile = await getUserProfile(name);
    recommendState.profile = profile;

    const watched = (profile.watched || []).filter(Boolean);
    const liked = (profile.liked || []).filter(Boolean);

    card.style.display = 'block';
    el.innerHTML = `
        <h3 style="margin:0 0 0.85rem;">👤 ${MovieRecUI.esc(profile.name)} ${profile.age ? `<span style="color:var(--text-muted); font-weight:400;">(${profile.age} ปี)</span>` : ''}</h3>
        <div style="display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap;">
            <div class="mini-stat">
                <div class="mini-stat-number">${watched.length}</div>
                <div class="mini-stat-label">WATCHED</div>
            </div>
            <div class="mini-stat">
                <div class="mini-stat-number">${liked.length}</div>
                <div class="mini-stat-label">LIKED</div>
            </div>
        </div>
        ${watched.length ? `<div style="margin-bottom:1rem;"><strong style="font-size:0.9rem;">👁️ ดูแล้ว</strong><div class="tag-list">${watched.map((movie) => `<span class="badge badge-primary">${MovieRecUI.esc(movie)}</span>`).join('')}</div></div>` : ''}
        ${liked.length ? `<div><strong style="font-size:0.9rem;">❤️ ถูกใจ</strong><div class="tag-list">${liked.map((movie) => `<span class="badge badge-success">${MovieRecUI.esc(movie)}</span>`).join('')}</div></div>` : ''}
        ${!watched.length && !liked.length ? `<div class="section-note">ผู้ใช้นี้ยังไม่มี activity ใน graph ควรไปเลือกหนังจากหน้า Home ก่อน</div>` : ''}
    `;

    renderSummaryPanel();
}

function renderSummaryPanel() {
    const method = document.getElementById('recMethod').value;
    const profile = recommendState.profile;
    const el = document.getElementById('recommendSummary');

    if (!profile) {
        el.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🕸️</div>
                <h3>รอเลือก User</h3>
                <p>เมื่อเลือก user แล้ว ระบบจะสรุปว่ามีข้อมูลพอสำหรับ recommendation แบบไหนบ้าง</p>
            </div>`;
        return;
    }

    const watched = (profile.watched || []).filter(Boolean);
    const liked = (profile.liked || []).filter(Boolean);
    const readiness = {
        personalized: watched.length > 0 || liked.length > 0
            ? 'พร้อมใช้ personalized เพราะระบบมีข้อมูลที่เลือกจากหน้า Home แล้ว'
            : 'ยังไม่มีข้อมูลจากหน้า Home ให้ personalized ใช้งาน',
        collaborative: liked.length > 0
            ? 'พร้อมใช้ collaborative เพราะมีประวัติ liked แล้ว'
            : 'ควรมี LIKED อย่างน้อย 1 เรื่องเพื่อให้ collaborative แม่นขึ้น',
        genre: liked.length > 0
            ? 'พร้อมใช้ genre-based เพราะระบบดูจากหนังที่ user ชอบ'
            : 'genre-based ยังเบาบาง เพราะ user ยังไม่มี LIKED',
        popular: watched.length > 0 || liked.length > 0
            ? 'popular ใช้ได้ทันที และจะตัดเรื่องที่ user เคยมี activity ออก'
            : 'popular ใช้ได้แม้ยังไม่มี activity'
    };

    const methodLabels = {
        personalized: '✨ Personalized',
        collaborative: '👥 Collaborative',
        genre: '🎭 Genre-based',
        popular: '🔥 Popular'
    };

    el.innerHTML = `
        <h3 style="margin-top:0;">${methodLabels[method]}</h3>
        <div class="section-note" style="margin-top:0.75rem;">${readiness[method]}</div>
        <div class="tag-list">
            <span class="badge badge-primary">WATCHED ${watched.length}</span>
            <span class="badge badge-success">LIKED ${liked.length}</span>
        </div>
    `;
}

async function handleRecommend() {
    const name = document.getElementById('recUser').value;
    const method = document.getElementById('recMethod').value;
    const btn = document.getElementById('recBtn');
    const resultsCard = document.getElementById('resultsCard');
    const resultsEl = document.getElementById('recResults');

    if (!name) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> กำลังวิเคราะห์...';
    resultsCard.style.display = 'block';
    resultsEl.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><span>กำลังวิเคราะห์ graph...</span></div>';

    try {
        const results = await getRecommendation(name, method);
        displayResults(Array.isArray(results) ? results : [], method);
        await hydrateRecommendationPosters(results);
    } catch (error) {
        resultsEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><h3>เกิดข้อผิดพลาด</h3><p>${MovieRecUI.esc(error.message)}</p></div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'แนะนำเลย';
    }
}

function buildReason(item, method) {
    if (item.reason) return item.reason;
    if (method === 'personalized') return 'แนะนำจากสิ่งที่ผู้ใช้เลือกไว้ในหน้า Home ทั้ง WATCHED และ LIKED';
    if (method === 'collaborative') return 'แนะนำจากผู้ใช้ที่ชอบหนังคล้ายกัน';
    if (method === 'genre') return `แนะนำจาก genre ${item.genre || ''}`.trim();
    return 'แนะนำจากความนิยมรวมของระบบ';
}

function displayResults(results, method) {
    const container = document.getElementById('recResults');
    document.getElementById('resultCount').textContent = `${results.length} เรื่อง`;

    if (!results.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🤷</div>
                <h3>ยังไม่มีผลลัพธ์</h3>
                <p>ลองกลับไปหน้า Home แล้วเลือก WATCHED หรือ LIKED เพิ่มอีกหน่อย จากนั้นกลับมาหน้านี้ใหม่</p>
            </div>`;
        return;
    }

    const maxScore = Math.max(...results.map((item) => Number(item.score) || 0), 1);
    const methodBadge = {
        personalized: 'Personalized',
        collaborative: 'Collaborative',
        genre: 'Genre-based',
        popular: 'Popular'
    }[method];

    container.innerHTML = `
        <div class="toolbar" style="margin-bottom:1rem;">
            <span class="badge badge-primary">${methodBadge}</span>
        </div>
        <div class="rec-results">
            ${results.map((item, index) => {
                const score = Number(item.score) || 0;
                const pct = Math.max(10, Math.round((score / maxScore) * 100));
                return `
                    <div class="rec-card">
                        ${item.image_url
                            ? `<div class="rec-card-poster"><img src="${MovieRecUI.esc(item.image_url)}" alt="${MovieRecUI.esc(item.title)}" data-rec-poster="${MovieRecUI.esc(item.title)}"></div>`
                            : `<div class="rec-card-poster"><div class="rec-card-poster-placeholder" data-rec-poster-placeholder="${MovieRecUI.esc(item.title)}">🎬</div></div>`}
                        <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                            <div>
                                <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.35rem;">อันดับ #${index + 1}</div>
                                <div class="rec-card-title">${RECOMMEND_GENRE_ICONS[item.genre] || '🎬'} ${MovieRecUI.esc(item.title)}</div>
                            </div>
                            <div class="rec-score">${pct}%</div>
                        </div>
                        <div class="rec-card-meta">
                            ${item.genre ? `<span class="badge badge-primary">${MovieRecUI.esc(item.genre)}</span>` : ''}
                            ${item.year ? `<span class="badge badge-warning">${item.year}</span>` : ''}
                            <span class="badge badge-success">Score ${score}</span>
                        </div>
                        ${item.description ? `<div class="rec-reason">${MovieRecUI.esc(item.description)}</div>` : ''}
                        <div class="rec-reason">💡 ${MovieRecUI.esc(buildReason(item, method))}</div>
                        <div class="score-bar"><div class="score-bar-fill" style="width:${pct}%"></div></div>
                    </div>
                `;
            }).join('')}
        </div>`;
}

async function hydrateRecommendationPosters(results) {
    if (!Array.isArray(results) || !results.length) return;

    const byTitle = new Map(results.map((item) => [item.title, item]));
    const posterNodes = document.querySelectorAll('[data-rec-poster], [data-rec-poster-placeholder]');

    for (const node of posterNodes) {
        const title = node.getAttribute('data-rec-poster') || node.getAttribute('data-rec-poster-placeholder');
        const item = byTitle.get(title);
        if (!item) continue;

        const poster = await MovieRecUI.resolvePosterUrl(item);
        if (!poster) continue;

        item.image_url = poster;

        if (node.tagName === 'IMG') {
            node.setAttribute('src', poster);
            continue;
        }

        node.outerHTML = `<img src="${MovieRecUI.esc(poster)}" alt="${MovieRecUI.esc(title)}" data-rec-poster="${MovieRecUI.esc(title)}">`;
    }
}
