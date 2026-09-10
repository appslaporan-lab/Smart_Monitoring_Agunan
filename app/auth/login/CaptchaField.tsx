'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getNewCaptcha } from './actions';

export default function CaptchaField({ initialCaptcha }: { initialCaptcha: { question: string; token: string } }) {
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    const newCap = await getNewCaptcha();
    setCaptcha(newCap);
    setLoading(false);
  };

  return (
    <div className="login-form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="label" style={{ margin: 0 }}>Verifikasi: Berapa {captcha.question} ?</label>
        <button type="button" onClick={handleRefresh} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', padding: '4px' }} title="Refresh Captcha">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <input type="text" name="captchaAnswer" className="inputField" placeholder="Jawaban" required inputMode="numeric" style={{ marginTop: '8px' }} />
      <input type="hidden" name="captchaToken" value={captcha.token} />
    </div>
  );
}
