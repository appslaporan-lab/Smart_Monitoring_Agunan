const fs = require('fs');
let code = fs.readFileSync('app/superadmin/users/UserActions.tsx', 'utf8');

const newUI = `
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="button secondary"
          disabled={loading}
          onClick={handleResetPassword}
        >
          {loading ? 'Memproses...' : 'Reset Password'}
        </button>
        <button
          type="button"
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          disabled={loading}
          onClick={handleDelete}
        >
          <Trash2 size={16} /> Hapus
        </button>
      </div>`;

const matchRegex = /<button[\s\S]*?<\/button>/;
code = code.replace(matchRegex, newUI);

fs.writeFileSync('app/superadmin/users/UserActions.tsx', code);
