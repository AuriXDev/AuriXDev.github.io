function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function convertMarkdownToHtml(md) {
    if (!md) return '';
    try {
        let html = md;
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\s*)+)/gm, function(match) {
            return '<ul>' + match.trim() + '</ul>';
        });
        html = html.replace(/^\|(.+)\|$/gm, function(match, content) {
            const cells = content.split('|').map(c => c.trim());
            if (cells.every(c => /^[-:]+$/.test(c))) {
                return '|' + content + '|';
            }
            return '<tr><td>' + cells.join('</td><td>') + '</td></tr>';
        });
        
        html = html.replace(/\|(.+)\|/g, function(match, content) {
            const cells = content.split('|').map(c => c.trim());
            return '<tr><td>' + cells.join('</td><td>') + '</td></tr>';
        });
        html = html.replace(/((?:<tr>.*<\/tr>\s*)+)/gm, function(match) {
            return '<table class="ai-table"><tbody>' + match.trim() + '</tbody></table>';
        });
        
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#667eea;">$1</a>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
            return '<pre><code class="language-' + (lang || 'plaintext') + '">' + escapeHtml(code) + '</code></pre>';
        });
        html = html.replace(/\n/g, '<br>');
        return html;
    } catch (err) {
        console.error('Markdown conversion error:', err);
        return '<pre>' + escapeHtml(md) + '</pre>';
    }
}

function formatMessageContent(content) {
    if (!content) return '';
    if (!window.codeBlocksStorage) window.codeBlocksStorage = {};

    const specials = [];
    function saveSpecial(html) {
        const idx = specials.length;
        specials.push(html);
        return `\x00SPECIAL${idx}\x00`;
    }

    let result = content;

    result = result.replace(/<think>([\s\S]*?)<\/think>/gi, (_, inner) =>
        saveSpecial(`<div class="thinking-block">${inner.trim()}</div>`)
    );

    result = result.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        const clean = code.replace(/^\n/, '').replace(/\n$/, '');
        const id = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2,8);
        window.codeBlocksStorage[id] = clean;
        const esc = clean.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return saveSpecial(
            `<div class="code-block-wrapper"><button class="copy-code-btn" onclick="copyCodeBlockById('${id}',this)">Копировать</button><pre><code class="language-${lang||'plaintext'}">${esc}</code></pre></div>`
        );
    });

    result = result.replace(
        /^[ \t]*\|.+\|[ \t]*\r?\n[ \t]*\|[ \t]*[-:| \t]+\|[ \t]*\r?\n(?:[ \t]*\|.+\|[ \t]*\r?\n?)*/gm,
        (match) => {
            const rows = match.trim().split(/\r?\n/).filter(r => r.trim());
            if (rows.length < 2) return match;

            // Строка-разделитель — та, что целиком из |, -, :, пробелов
            const sepIdx = rows.findIndex(r => /^[ \t]*\|[ \t]*[-:| \t]+\|[ \t]*$/.test(r));
            if (sepIdx < 1) return match;

            function parseRow(row) {
                return row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            }

            function renderInline(text) {
                const parts = [];
                const tokenRe = /(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*|__[^_\n]+__|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g;
                let last = 0, m;
                while ((m = tokenRe.exec(text)) !== null) {
                    if (m.index > last) parts.push({ type: 'text', val: text.slice(last, m.index) });
                    parts.push({ type: 'md', val: m[0] });
                    last = tokenRe.lastIndex;
                }
                if (last < text.length) parts.push({ type: 'text', val: text.slice(last) });
                return parts.map(p => {
                    if (p.type === 'text') return p.val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                    const v = p.val;
                    if (v.startsWith('`')) { const inner = v.slice(1,-1).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return '<code>' + inner + '</code>'; }
                    if (v.startsWith('***')) return '<strong><em>' + renderInline(v.slice(3,-3)) + '</em></strong>';
                    if (v.startsWith('**'))  return '<strong>' + renderInline(v.slice(2,-2)) + '</strong>';
                    if (v.startsWith('__'))  return '<strong>' + renderInline(v.slice(2,-2)) + '</strong>';
                    if (v.startsWith('*'))   return '<em>' + renderInline(v.slice(1,-1)) + '</em>';
                    if (v.startsWith('_'))   return '<em>' + renderInline(v.slice(1,-1)) + '</em>';
                    const lm = v.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (lm) return '<a href="' + lm[2] + '" target="_blank" style="color:#667eea;">' + renderInline(lm[1]) + '</a>';
                    return v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                }).join('');
            }

            const headerCells = parseRow(rows[0]);
            let html = '<table class="ai-table"><thead><tr>';
            headerCells.forEach(h => { html += `<th>${renderInline(h)}</th>`; });
            html += '</tr></thead><tbody>';

            for (let i = sepIdx + 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row || /^[ \t]*\|[ \t]*[-:| \t]+\|[ \t]*$/.test(row)) continue;
                const cells = parseRow(row);
                html += '<tr>';
                cells.forEach(c => { html += `<td>${renderInline(c)}</td>`; });
                html += '</tr>';
            }

            html += '</tbody></table>';
            return saveSpecial(html);
        }
    );

    result = result.split('\x00').map((part, i) => {
        if (i % 2 === 1 && part.startsWith('SPECIAL')) return '\x00' + part + '\x00';
        return part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }).join('');

    result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
    result = result.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    result = result.replace(/_([^_\n]+)_/g, '<em>$1</em>');
    result = result.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#667eea;">$1</a>');
    result = result.replace(/^---+$/gm, '<hr>');
    result = result.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
    result = result.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
    result = result.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
    result = result.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    result = result.replace(/^&gt;\s*(.*)$/gm, '<blockquote>$1</blockquote>');
    result = result.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return saveSpecial(`<ol>${items}</ol>`);});
    result = result.replace(/((?:^[ \t]*[-*]\s+.+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[ \t]*[-*]\s+/, '')}</li>`).join('');
        return saveSpecial(`<ul>${items}</ul>`);});

    const chunks = result.split(/\n{2,}/);
    result = chunks.map(chunk => {
        chunk = chunk.trim();
        if (!chunk) return '';
        if (/^\x00SPECIAL\d+\x00$/.test(chunk)) return chunk;
        if (/^<(h[1-6]|blockquote|hr|ol|ul|table)/.test(chunk)) return chunk;
        return '<p>' + chunk.replace(/\n/g, '<br>') + '</p>';
    }).join('');

    result = result.replace(/\x00SPECIAL(\d+)\x00/g, (_, i) => specials[parseInt(i)] || '');
    result = result.replace(/<p>\s*<\/p>/g, '');

    return result;
}

window.codeBlocksStorage = {};
window.copyCodeBlockById = function(blockId, btn) {
    const originalCode = window.codeBlocksStorage[blockId];
    if (!originalCode) {
        btn.textContent = 'Ошибка';
        setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
        return;
    }
    navigator.clipboard.writeText(originalCode).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Скопировано!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        btn.textContent = 'Ошибка';
        setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
    });
};