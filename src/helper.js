export function removeAndMergeDuplicates(array, key1, key2, mergeField) {
  let mergedObjects = {};
  array.forEach(item => {
    const key = item[key1] + "|" + item[key2];
    if (mergedObjects[key]) {
      mergedObjects[key][mergeField] += item[mergeField];
    } else {
      mergedObjects[key] = { ...item };
    }
  });
  return Object.values(mergedObjects);
}

export function sortByKey(array, key, ascending = false) {
  // Clone the array to avoid modifying the original array
  const newArray = [...array];
  // Sort the cloned array based on the specified key
  newArray.sort((a, b) => {
      let comparison = 0;
      if (a[key] > b[key]) {
          comparison = 1;
      } else if (a[key] < b[key]) {
          comparison = -1;
      }
      // If sorting in descending order, reverse the comparison result
      return ascending ? comparison : comparison * -1;
  });

  return newArray;
}

export function filterRule(card,filter){
  if(
    (card.xp === 0 && filter.zeroXp) || 
    (card.xp !== 0 && filter.upgraded)
  ){
    return filter[card.faction_code]
  }else{
    return false
  }
}