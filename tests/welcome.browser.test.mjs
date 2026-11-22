// Run against a local app and an isolated Chrome launched with --remote-debugging-port=9333.
// node tests/welcome.browser.test.mjs [app URL] [Chrome debugging URL]
import assert from 'node:assert/strict';

const appUrl = process.argv[2] || 'http://127.0.0.1:5173';
const debugUrl = process.argv[3] || 'http://127.0.0.1:9333';
const tabs = await (await fetch(`${debugUrl}/json`)).json();
const tab = tabs.find(item => item.type === 'page');
assert.ok(tab, 'An isolated Chrome page must be available');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    const error = message.params.exceptionDetails;
    errors.push(error.exception?.description || error.text);
  }
  if (message.id) {
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const next = ++id;
  const timeout = setTimeout(() => { pending.delete(next); reject(new Error(`Timed out: ${method}`)); }, 10000);
  pending.set(next, message => { clearTimeout(timeout); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
  socket.send(JSON.stringify({ id: next, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true });
  assert.ok(!result.exceptionDetails, result.exceptionDetails?.text);
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(expression) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  assert.fail(`Timed out waiting for ${expression}`);
}

try {
  await send('Runtime.enable');
  for (const mode of ['no-preference', 'reduce']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: mode }] });
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${appUrl}/login` });
    await waitFor('!!document.querySelector("input[aria-label=Email]")');
    // This browser profile is isolated from the user's browser and saved data.
    await evaluate(`localStorage.removeItem('roomies:resident:resident@gmail.com')`);
    await evaluate(`(() => {
      for (const [label, value] of [['Email', 'resident@gmail.com'], ['Password', '1234']]) {
        const input = document.querySelector('input[aria-label="' + label + '"]');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await pause(100);
    await evaluate(`Array.from(document.querySelectorAll('[role=button]')).find(button => button.textContent === 'Log In').click()`);
    await waitFor(`!!document.querySelector('[aria-label*=" says: "]')`);
    for (let tap = 0; tap < 40; tap++) {
      if (!await evaluate(`(() => { const dialogue = document.querySelector('[aria-label*=" says: "]'); if (!dialogue) return false; dialogue.click(); return true; })()`)) break;
      await pause(100);
    }
    await waitFor(`!document.querySelector('[aria-label*=" says: "]') && document.body.innerText.includes('Coming up')`);
    assert.equal(await evaluate('location.pathname'), '/home');
    assert.match(await evaluate('document.body.innerText'), /Resident Roomie/);
    assert.match(await evaluate('document.body.innerText'), /Coming up/);
    assert.ok(await evaluate(`!!JSON.parse(localStorage.getItem('roomies:resident:resident@gmail.com')).welcomeSeen`));
    await evaluate(`document.querySelector('[role=tab][aria-label=Expenses]').click()`);
    await waitFor(`!document.body.innerText.includes('Coming up') && document.body.innerText.includes('Expenses')`);
    await evaluate(`document.querySelector('[role=tab][aria-label=Home]').click()`);
    await waitFor(`document.body.innerText.includes('Coming up')`);
    assert.equal(await evaluate(`!!document.querySelector('[aria-label*=" says: "]')`), false);
    assert.deepEqual(errors, [], 'Completing the dialogue must not crash animation cleanup');
    console.log(`PASS resident login → dialogue → usable dashboard (${mode})`);
  }
} catch (error) {
  console.error('Browser errors:', errors);
  console.error('Page:', await evaluate('({ path: location.pathname, text: document.body.innerText.slice(0, 1200) })'));
  throw error;
} finally {
  socket.close();
}
