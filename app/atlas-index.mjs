import names from './anatomical-names.json' with {type:'json'};
import coreIds from './core-ids.json' with {type:'json'};

export function anatomicalName(name) {
  return names[name.toLowerCase()] ?? name;
}

export function assistantConcepts(concepts, message, previous = '') {
  const current = message.toLowerCase();
  const history = previous.toLowerCase();
  const entries = concepts.map(({id,name}) => ({id,name,zh:anatomicalName(name)}));
  const matches = entries.map(entry => {
    const terms = [entry.id, entry.name, entry.zh].map(term => term.toLowerCase());
    const score = Math.max(...terms.map(term => current.includes(term) ? 1000 + term.length :
      history.includes(term) ? term.length : 0));
    return {entry, score};
  }).filter(item => item.score > 0 && !coreIds.includes(item.entry.id));
  matches.sort((a,b) => b.score - a.score);
  return [...entries.filter(entry => coreIds.includes(entry.id)), ...matches.slice(0,20).map(item => item.entry)];
}
