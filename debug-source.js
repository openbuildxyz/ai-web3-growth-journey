const { source } = require('./lib/source.ts');

console.log('测试 source.getPage():');
console.log('zh, []:', source.getPage([], 'zh'));
console.log('zh, undefined:', source.getPage(undefined, 'zh'));
console.log('zh, ["index"]:', source.getPage(['index'], 'zh'));

console.log('\n所有中文页面:');
const allPages = source.pageTree.zh;
console.log(JSON.stringify(allPages, null, 2));
