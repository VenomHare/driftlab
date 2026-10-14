const $ = (s) => document.querySelector(s);
const health = $('#health'), run = $('#run'), reset = $('#reset'), events = $('#events');
function badge(status) { return `<b class="status ${status}">${status.toUpperCase()}</b>`; }
async function check() {
  const r = await fetch('/api/health'); const h = await r.json();
  health.textContent = h.agentConfigured && h.armorConfigured ? '● SYSTEMS ARMED' : '● SETUP REQUIRED';
  health.classList.toggle('armed', h.agentConfigured && h.armorConfigured);
}
function fail(reason) { $('#runstate').textContent = 'INTEGRATION ERROR'; $('#sealIcon').textContent = '!'; $('#sealLabel').textContent = 'NO PROOF PRODUCED'; $('#notice').textContent = reason; }
run.onclick = async () => {
  run.disabled = true; run.innerHTML = 'Verifying intent <span class="spin">◌</span>'; $('#runstate').textContent = 'RUNNING'; events.innerHTML = '<li class="empty"><span class="spin">◌</span> Model planning and ArmorIQ enforcement in progress…</li>';
  try { const r = await fetch('/api/demo/run', { method: 'POST' }); const data = await r.json(); if (!r.ok || data.status === 'integration_error') { fail(data.reason); return; }
    const scenario = data.scenario; $('#runstate').textContent = scenario.proof.ready ? 'VERIFIED' : 'CHECK RESULTS'; $('#plan').textContent = data.agent.plan.map(x => `${x.name}(${x.args.path})`).join(', ');
    events.innerHTML = scenario.events.map((e, i) => `<li class="event ${e.status}"><span class="node">0${i+1}</span><div><small>${e.step}</small><strong>${e.tool}</strong><p>${e.status === 'allowed' ? 'ArmorIQ approved the planned action; handler ran.' : e.status === 'blocked' ? 'ArmorIQ refused the unplanned action; handler was unreachable.' : e.reason}</p></div>${badge(e.status)}</li>`).join('');
    const allowed = scenario.events[0], blocked = scenario.events[1]; $('#allow').innerHTML = badge(allowed.status); $('#block').innerHTML = badge(blocked.status); $('#handler').textContent = blocked.evidence.handlerExecuted ? 'EXECUTED — INVESTIGATE' : 'NOT EXECUTED';
    $('#sealIcon').textContent = scenario.proof.ready ? '✓' : '!'; $('#sealLabel').textContent = scenario.proof.ready ? 'DECISIONS VERIFIED' : 'REVIEW TRACE'; $('#notice').textContent = scenario.proof.ready ? 'ArmorIQ allowed the signed plan and stopped the injected action before the handler.' : 'The run completed, but did not produce the required allow + block proof.';
  } catch (e) { fail(`Request failed: ${e.message}`); } finally { run.disabled = false; run.innerHTML = 'Run security drill <span>↗</span>'; }
};
reset.onclick = async () => { await fetch('/api/demo/reset', { method: 'POST' }); location.reload(); };
check().catch(() => { health.textContent = '● API OFFLINE'; });
