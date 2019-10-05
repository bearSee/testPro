export default function arrayToTree(data, pid = 'parentId', value = 'value', children = 'children', root = '0') {
  const formatting = data.slice(0);
  if (!formatting.length) return [];
  // let sum = 0;
  // let time = new Date();

  function getNode(id) {
    while (formatting.length) {
      const node = [];
      for (let i = 0; i < formatting.length; i++) {
        // sum++;
        const temp = formatting[i];
        if ((id === root && !formatting[i][pid]) || formatting[i][pid] === id) {
          formatting.splice(i, 1)
          const child = getNode(temp[value]);

          if (child) {
            temp[children] = child;
          }
          node.push(temp);
          i = -1;
        }
      }

      if (node.length) {
        // console.log(sum);
        // console.log(new Date() - time);
        return node;
      } else {
        return id === root ? formatting : null;
      }
    }
  }
  return getNode(root);
}
