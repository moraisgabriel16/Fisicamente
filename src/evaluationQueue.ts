type Queued = {request_key:string};

// Persist each confirmed batch before sending the next. Retries retain the
// original keys, including when the server received a batch but the reply failed.
export async function drainEvaluations<T extends Queued>(
  current:()=>T[],
  sendBatch:(batch:T[])=>Promise<unknown>,
  acknowledge:(keys:Set<string>)=>Promise<void>,
){
  while(current().length){
    const batch=current().slice(0,200);
    await sendBatch(batch);
    await acknowledge(new Set(batch.map(row=>row.request_key)));
  }
}
