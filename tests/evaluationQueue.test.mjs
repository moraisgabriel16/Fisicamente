import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source=await readFile(new URL('../src/evaluationQueue.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {drainEvaluations}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const rows=n=>Array.from({length:n},(_,i)=>({request_key:'evaluation-'+i}));

test('450 queued evaluations fit the API limit and are acknowledged once',async()=>{
  let queue=rows(450);const received=[];
  await drainEvaluations(()=>queue,async batch=>{assert.ok(batch.length<=200);received.push(...batch)},async keys=>{queue=queue.filter(r=>!keys.has(r.request_key))});
  assert.equal(queue.length,0);
  assert.equal(received.length,450);
  assert.equal(new Set(received.map(r=>r.request_key)).size,450);
});

test('a failed second batch preserves unconfirmed records and retry keys',async()=>{
  let queue=rows(450),attempts=0;const original=queue.slice(200).map(r=>r.request_key);
  const acknowledge=async keys=>{queue=queue.filter(r=>!keys.has(r.request_key))};
  await assert.rejects(drainEvaluations(()=>queue,async()=>{if(++attempts===2)throw new Error('connection lost')},acknowledge),/connection lost/);
  assert.deepEqual(queue.map(r=>r.request_key),original);
  const retried=[];
  await drainEvaluations(()=>queue,async batch=>retried.push(...batch.map(r=>r.request_key)),acknowledge);
  assert.deepEqual(retried,original);
  assert.equal(queue.length,0);
});

test('new evaluations appended during a request are retained and sent',async()=>{
  let queue=rows(1);const sent=[];
  await drainEvaluations(()=>queue,async batch=>{sent.push(...batch.map(r=>r.request_key));if(sent.length===1)queue.push({request_key:'new-evaluation'})},async keys=>{queue=queue.filter(r=>!keys.has(r.request_key))});
  assert.deepEqual(sent,['evaluation-0','new-evaluation']);
  assert.equal(queue.length,0);
});

test('failure to persist acknowledgment leaves the batch available for an idempotent retry',async()=>{
  const queue=rows(3),keys=queue.map(r=>r.request_key);let sent;
  await assert.rejects(drainEvaluations(()=>queue,async batch=>{sent=batch.map(r=>r.request_key)},async()=>{throw new Error('storage unavailable')}),/storage unavailable/);
  assert.deepEqual(sent,keys);
  assert.deepEqual(queue.map(r=>r.request_key),keys);
});
